ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS preorder boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preorder_eta text;

CREATE OR REPLACE FUNCTION public.apply_purchase_stock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'received' AND OLD.status IS DISTINCT FROM 'received' THEN
    UPDATE public.products p
    SET stock_qty = p.stock_qty + i.qty,
        in_stock = true,
        preorder = false,
        preorder_eta = NULL
    FROM (
      SELECT product_id, SUM(quantity)::int AS qty
      FROM public.purchase_order_items
      WHERE purchase_order_id = NEW.id AND product_id IS NOT NULL
      GROUP BY product_id
    ) i
    WHERE p.id = i.product_id;
  END IF;
  RETURN NEW;
END;
$function$;