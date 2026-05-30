-- supabase/migrations/20260530000001_abandoned_cart_cron.sql

CREATE OR REPLACE FUNCTION cancel_abandoned_orders()
RETURNS VOID AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  -- Find pending orders older than 15 minutes
  FOR v_order IN
    SELECT id FROM orders 
    WHERE payment_status = 'pending' 
      AND created_at < NOW() - INTERVAL '15 minutes'
  LOOP
    -- Restore inventory for each item
    FOR v_item IN
      SELECT product_id, quantity FROM order_items WHERE order_id = v_order.id
    LOOP
      UPDATE products
      SET inventory_count = inventory_count + v_item.quantity
      WHERE id = v_item.product_id;
    END LOOP;
    
    -- Mark order as cancelled
    UPDATE orders
    SET order_status = 'cancelled', payment_status = 'failed'
    WHERE id = v_order.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable the pg_cron extension (Supabase supports this)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run every 5 minutes
-- It will look for any orders older than 15 minutes
SELECT cron.schedule(
  'cancel_abandoned_orders_job',
  '*/5 * * * *',
  $$SELECT cancel_abandoned_orders();$$
);
