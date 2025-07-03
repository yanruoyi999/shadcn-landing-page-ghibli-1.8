-- 创建订阅计划枚举类型
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete', 'trialing');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');

-- 创建用户订阅表
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status subscription_status DEFAULT 'active',
  plan subscription_plan DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 创建支付历史表
CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- 金额（分）
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, failed, pending, etc.
  plan subscription_plan NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建使用量跟踪表
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  images_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建更新时间戳触发器
CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at 
  BEFORE UPDATE ON usage_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建 RLS (Row Level Security) 策略
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和更新自己的订阅信息
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能查看自己的支付历史
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能查看和更新自己的使用量
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- 系统可以插入和更新所有表（用于 webhook 和 API）
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage payments" ON payment_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage usage" ON usage_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- 创建获取用户订阅信息的函数
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  subscription_plan TEXT,
  subscription_status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  images_used_today INTEGER,
  images_limit INTEGER
) AS $$
DECLARE
  user_plan subscription_plan;
  user_status subscription_status;
  period_end TIMESTAMP WITH TIME ZONE;
  today_usage INTEGER;
  plan_limit INTEGER;
BEGIN
  -- 获取用户订阅信息
  SELECT plan, status, current_period_end
  INTO user_plan, user_status, period_end
  FROM user_subscriptions
  WHERE user_id = user_uuid;

  -- 如果没有订阅记录，设置为免费计划
  IF user_plan IS NULL THEN
    user_plan := 'free';
    user_status := 'active';
  END IF;

  -- 获取今日使用量
  SELECT COALESCE(images_generated, 0)
  INTO today_usage
  FROM usage_tracking
  WHERE user_id = user_uuid AND date = CURRENT_DATE;

  -- 设置计划限制
  CASE user_plan
    WHEN 'free' THEN plan_limit := 5;
    WHEN 'pro' THEN plan_limit := 100;
    WHEN 'enterprise' THEN plan_limit := -1; -- 无限制
  END CASE;

  RETURN QUERY SELECT 
    user_plan::TEXT,
    user_status::TEXT,
    period_end,
    COALESCE(today_usage, 0),
    plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建更新使用量的函数
CREATE OR REPLACE FUNCTION increment_usage(user_uuid UUID, increment_by INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, date, images_generated)
  VALUES (user_uuid, CURRENT_DATE, increment_by)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    images_generated = usage_tracking.images_generated + increment_by,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;