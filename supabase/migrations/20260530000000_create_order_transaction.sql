-- supabase/migrations/20260530000000_create_order_transaction.sql

CREATE OR REPLACE FUNCTION create_order_transaction(
  p_order_data JSONB,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_order_row RECORD;
  v_item JSONB;
BEGIN
  -- 1. Decrement and lock inventory
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE products
    SET inventory_count = inventory_count - (v_item->>'quantity')::integer
    WHERE id = (v_item->>'product_id')::uuid 
      AND inventory_count >= (v_item->>'quantity')::integer;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient inventory for product %', (v_item->>'product_id')::text;
    END IF;
  END LOOP;

  -- 2. Insert the order using jsonb_populate_record to dynamically insert all fields
  -- This handles 'cod_charge', 'razorpay_order_id', etc. automatically if they exist in the DB schema.
  INSERT INTO orders
  SELECT * FROM jsonb_populate_record(null::orders, p_order_data)
  RETURNING * INTO v_order_row;

  -- 3. Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (
      v_order_row.id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price_at_purchase')::numeric
    );
  END LOOP;

  RETURN row_to_json(v_order_row)::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
