insert into public.users (id, role, full_name, organization_id)
values
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Avery Stone', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'analyst', 'Mina Patel', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('33333333-3333-3333-3333-333333333333', 'analyst', 'Jordan Kim', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('44444444-4444-4444-4444-444444444444', 'viewer', 'Noah Lee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
on conflict (id) do nothing;

insert into public.merchants (id, name, api_key_hash, webhook_url, status)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Atlas Commerce', 'demo_atlas_hash', 'https://atlas.example.com/fraud/webhook', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Nova Tickets', 'demo_nova_hash', 'https://nova.example.com/fraud/webhook', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Lumen Digital Goods', 'demo_lumen_hash', null, 'inactive')
on conflict (id) do nothing;

insert into public.devices (id, fingerprint_hash, browser, os, screen_resolution, timezone, language, webgl_hash, canvas_hash, user_agent, is_bot, risk_score, first_seen_at, last_seen_at, metadata)
values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'fp_001', 'Chrome 134', 'macOS', '1728x1117', 'America/New_York', 'en-US', 'wg_001', 'cv_001', 'Mozilla/5.0', false, 18, now() - interval '15 day', now() - interval '1 hour', '{"accounts_seen":1}'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'fp_002', 'Chrome 134', 'Windows', '1920x1080', 'Asia/Tokyo', 'en-US', 'wg_002', 'cv_002', 'Mozilla/5.0 HeadlessChrome', true, 77, now() - interval '12 hour', now() - interval '30 minute', '{"accounts_seen":5,"headless":true}'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'fp_003', 'Safari 17', 'iOS', '1179x2556', 'Europe/London', 'en-GB', 'wg_003', 'cv_003', 'Mozilla/5.0', false, 29, now() - interval '4 day', now() - interval '3 hour', '{"accounts_seen":2}'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'fp_004', 'Firefox 136', 'Windows', '1440x900', 'America/Chicago', 'en-US', 'wg_004', 'cv_004', 'Mozilla/5.0', false, 12, now() - interval '30 day', now() - interval '4 hour', '{"accounts_seen":1}'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'fp_005', 'Edge 134', 'Windows', '2560x1440', 'America/Los_Angeles', 'en-US', 'wg_005', 'cv_005', 'Mozilla/5.0', false, 24, now() - interval '7 day', now() - interval '2 hour', '{"accounts_seen":2}'),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'fp_006', 'Chrome 134', 'Android', '1080x2400', 'Europe/Berlin', 'de-DE', 'wg_006', 'cv_006', 'Mozilla/5.0', false, 35, now() - interval '2 day', now() - interval '1 hour', '{"accounts_seen":3}'),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'fp_007', 'Safari 17', 'iOS', '1170x2532', 'America/Toronto', 'en-CA', 'wg_007', 'cv_007', 'Mozilla/5.0', false, 21, now() - interval '9 day', now() - interval '6 hour', '{"accounts_seen":1}'),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'fp_008', 'Chrome 134', 'Linux', '1366x768', 'Asia/Singapore', 'en-SG', 'wg_008', 'cv_008', 'Mozilla/5.0', false, 40, now() - interval '1 day', now() - interval '20 minute', '{"accounts_seen":4}'),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'fp_009', 'Firefox 136', 'macOS', '1512x982', 'America/Denver', 'en-US', 'wg_009', 'cv_009', 'Mozilla/5.0', false, 16, now() - interval '22 day', now() - interval '7 hour', '{"accounts_seen":1}'),
  ('bbbbbbbb-0000-0000-0000-000000000010', 'fp_010', 'Chrome 134', 'Windows', '1920x1080', 'Asia/Dubai', 'en-US', 'wg_010', 'cv_010', 'Mozilla/5.0', false, 55, now() - interval '18 hour', now() - interval '10 minute', '{"accounts_seen":6}')
on conflict (id) do nothing;

insert into public.risk_rules (id, name, description, condition, action, score_impact, is_active, priority, created_by)
values
  ('cccccccc-0000-0000-0000-000000000001', 'High amount transaction', 'Score when amount exceeds 5000.', '{"field":"amount","operator":"gt","value":5000}', 'review', 30, true, 10, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000002', 'New device', 'Flag devices seen within 24 hours.', '{"field":"device_age_hours","operator":"lt","value":24}', 'flag', 15, true, 20, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000003', 'Country mismatch', 'Billing and shipping mismatch against IP country.', '{"field":"country_mismatch","operator":"eq","value":true}', 'review', 25, true, 15, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000004', 'Velocity over 5 per hour', 'User exceeds 5 transactions in 1 hour.', '{"field":"transaction_count_1h","operator":"gt","value":5}', 'review', 20, true, 12, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000005', 'Known bad IP', 'Blacklist hit should decline.', '{"field":"ip_blacklisted","operator":"eq","value":true}', 'decline', 45, true, 5, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000006', 'Whitelisted user', 'Trusted user auto approval.', '{"field":"user_whitelisted","operator":"eq","value":true}', 'approve', -35, true, 1, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000007', 'Disposable email domain', 'Common throwaway email providers.', '{"field":"email_domain","operator":"in","value":["throwawaymail.com","maildrop.cc","temp-mail.org"]}', 'review', 18, true, 18, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000008', 'High-risk BIN', 'Known risky issuing range.', '{"field":"card_bin","operator":"in","value":["545454","601100","483312"]}', 'review', 17, true, 22, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000009', 'Critical amount', 'Large purchase spike.', '{"field":"amount","operator":"gt","value":9000}', 'decline', 45, true, 3, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000010', 'Card and wallet mismatch region', 'Wallet usage from risky cross-border region.', '{"field":"wallet_region_mismatch","operator":"eq","value":true}', 'flag', 12, true, 30, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000011', 'Device seen on many accounts', 'Shared device across many accounts.', '{"field":"device_accounts_seen","operator":"gt","value":3}', 'review', 16, true, 16, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000012', 'Night-time high value', 'High-value purchase during overnight hours.', '{"field":"local_hour","operator":"lt","value":5}', 'flag', 9, true, 28, '11111111-1111-1111-1111-111111111111')
on conflict (id) do nothing;

insert into public.whitelists_blacklists (id, entity_type, entity_value, list_type, reason, expires_at)
values
  ('dddddddd-0000-0000-0000-000000000001', 'ip', '103.22.14.1', 'blacklist', 'Repeat chargeback cluster', null),
  ('dddddddd-0000-0000-0000-000000000002', 'device', 'fp_010', 'blacklist', 'Shared device fraud ring', now() + interval '30 day'),
  ('dddddddd-0000-0000-0000-000000000003', 'email_domain', 'trustedcorp.com', 'whitelist', 'Verified enterprise customer', null),
  ('dddddddd-0000-0000-0000-000000000004', 'card_bin', '424242', 'whitelist', 'Internal sandbox card range', null),
  ('dddddddd-0000-0000-0000-000000000005', 'email', 'vip@trustedcorp.com', 'whitelist', 'Manual analyst review approved', null)
on conflict (entity_type, entity_value, list_type) do nothing;

insert into public.transactions (
  id,
  merchant_id,
  external_transaction_id,
  amount,
  currency,
  payment_method_type,
  card_bin,
  card_last4,
  billing_country,
  shipping_country,
  ip_address,
  device_id,
  user_account_id,
  risk_score,
  risk_level,
  status,
  metadata,
  scored_at,
  created_at
)
select
  gen_random_uuid(),
  case
    when gs % 3 = 0 then 'aaaaaaaa-0000-0000-0000-000000000001'::uuid
    when gs % 3 = 1 then 'aaaaaaaa-0000-0000-0000-000000000002'::uuid
    else 'aaaaaaaa-0000-0000-0000-000000000003'::uuid
  end,
  'TX-' || lpad(gs::text, 5, '0'),
  case
    when gs % 10 = 0 then 7200 + (gs * 10)
    when gs % 7 = 0 then 1800 + (gs * 6)
    else 20 + (gs * 14)
  end::numeric(12,2),
  'USD',
  case
    when gs % 4 = 0 then 'wallet'::public.payment_method_kind
    when gs % 6 = 0 then 'bank'::public.payment_method_kind
    else 'card'::public.payment_method_kind
  end,
  (array['424242','545454','601100','483312','400012'])[1 + (gs % 5)],
  lpad((1000 + gs)::text, 4, '0'),
  (array['US','US','GB','CA','DE','AE'])[1 + (gs % 6)],
  case when gs % 9 = 0 then 'JP' else (array['US','US','GB','CA','DE','AE'])[1 + (gs % 6)] end,
  (array['24.32.10.11','103.22.14.1','81.19.24.8','44.89.32.11','64.22.120.55','52.20.10.91'])[1 + (gs % 6)]::inet,
  (array[
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000005',
    'bbbbbbbb-0000-0000-0000-000000000006',
    'bbbbbbbb-0000-0000-0000-000000000007',
    'bbbbbbbb-0000-0000-0000-000000000008',
    'bbbbbbbb-0000-0000-0000-000000000009',
    'bbbbbbbb-0000-0000-0000-000000000010'
  ])[1 + (gs % 10)]::uuid,
  'acct_' || lpad((1 + (gs % 18))::text, 4, '0'),
  least(
    100,
    8
    + case when gs % 10 = 0 then 42 else 0 end
    + case when gs % 7 = 0 then 22 else 0 end
    + case when gs % 9 = 0 then 18 else 0 end
    + case when gs % 5 = 0 then 12 else 0 end
    + case when gs % 11 = 0 then 9 else 0 end
  ),
  case
    when least(100, 8 + case when gs % 10 = 0 then 42 else 0 end + case when gs % 7 = 0 then 22 else 0 end + case when gs % 9 = 0 then 18 else 0 end + case when gs % 5 = 0 then 12 else 0 end + case when gs % 11 = 0 then 9 else 0 end) <= 25 then 'low'::public.risk_level
    when least(100, 8 + case when gs % 10 = 0 then 42 else 0 end + case when gs % 7 = 0 then 22 else 0 end + case when gs % 9 = 0 then 18 else 0 end + case when gs % 5 = 0 then 12 else 0 end + case when gs % 11 = 0 then 9 else 0 end) <= 50 then 'medium'::public.risk_level
    when least(100, 8 + case when gs % 10 = 0 then 42 else 0 end + case when gs % 7 = 0 then 22 else 0 end + case when gs % 9 = 0 then 18 else 0 end + case when gs % 5 = 0 then 12 else 0 end + case when gs % 11 = 0 then 9 else 0 end) <= 75 then 'high'::public.risk_level
    else 'critical'::public.risk_level
  end,
  case
    when least(100, 8 + case when gs % 10 = 0 then 42 else 0 end + case when gs % 7 = 0 then 22 else 0 end + case when gs % 9 = 0 then 18 else 0 end + case when gs % 5 = 0 then 12 else 0 end + case when gs % 11 = 0 then 9 else 0 end) < 30 then 'approved'::public.transaction_status
    when least(100, 8 + case when gs % 10 = 0 then 42 else 0 end + case when gs % 7 = 0 then 22 else 0 end + case when gs % 9 = 0 then 18 else 0 end + case when gs % 5 = 0 then 12 else 0 end + case when gs % 11 = 0 then 9 else 0 end) <= 70 then 'review'::public.transaction_status
    else 'declined'::public.transaction_status
  end,
  jsonb_build_object(
    'email', 'customer' || gs || '@' || case when gs % 8 = 0 then 'throwawaymail.com' else 'example.com' end,
    'velocity_1h', gs % 8,
    'country_mismatch', gs % 9 = 0
  ),
  now() - (gs || ' hours')::interval,
  now() - ((gs + 1) || ' hours')::interval
from generate_series(1, 72) as gs
on conflict (merchant_id, external_transaction_id) do nothing;

insert into public.risk_scores (
  transaction_id,
  overall_score,
  velocity_score,
  device_score,
  geo_score,
  behavioral_score,
  rule_score,
  ml_score,
  explanation
)
select
  t.id,
  t.risk_score,
  greatest(5, least(100, (t.risk_score * 0.30)::int)),
  greatest(5, least(100, (t.risk_score * 0.18)::int)),
  greatest(5, least(100, (t.risk_score * 0.15)::int)),
  greatest(5, least(100, (t.risk_score * 0.17)::int)),
  greatest(5, least(100, (t.risk_score * 0.10)::int)),
  greatest(5, least(100, (t.risk_score * 0.10)::int)),
  jsonb_build_object(
    'reasons', jsonb_build_array(
      case when t.risk_score > 70 then 'High-risk transaction profile.' else 'Routine transaction.' end,
      case when (t.metadata ->> 'country_mismatch')::boolean then 'Country mismatch detected.' else 'Location consistent.' end
    ),
    'triggeredRules', jsonb_build_array(
      case when t.amount > 5000 then 'High amount transaction' else 'New device' end
    )
  )
from public.transactions t
left join public.risk_scores rs on rs.transaction_id = t.id
where rs.transaction_id is null;

insert into public.sessions (id, user_account_id, device_id, ip_address, geo_country, geo_city, geo_lat, geo_lon, started_at, ended_at)
select
  gen_random_uuid(),
  t.user_account_id,
  t.device_id,
  t.ip_address,
  t.billing_country,
  case when t.billing_country = 'US' then 'New York' else 'London' end,
  case when t.billing_country = 'US' then 40.7128 else 51.5072 end,
  case when t.billing_country = 'US' then -74.0060 else -0.1276 end,
  t.created_at - interval '45 minute',
  t.created_at + interval '25 minute'
from public.transactions t
where not exists (
  select 1
  from public.sessions s
  where s.user_account_id = t.user_account_id
    and s.device_id = t.device_id
)
limit 24;

insert into public.payment_methods (id, user_account_id, type, provider, last4, is_verified, risk_level, created_at)
select
  gen_random_uuid(),
  'acct_' || lpad(gs::text, 4, '0'),
  case when gs % 3 = 0 then 'wallet'::public.payment_method_kind when gs % 4 = 0 then 'bank'::public.payment_method_kind else 'card'::public.payment_method_kind end,
  case when gs % 3 = 0 then 'PayPal' when gs % 4 = 0 then 'ACH' else 'Visa' end,
  lpad((1000 + gs)::text, 4, '0'),
  gs % 5 <> 0,
  case when gs % 6 = 0 then 'high'::public.risk_level when gs % 4 = 0 then 'medium'::public.risk_level else 'low'::public.risk_level end,
  now() - (gs || ' day')::interval
from generate_series(1, 18) gs
where not exists (
  select 1 from public.payment_methods pm where pm.user_account_id = 'acct_' || lpad(gs::text, 4, '0')
);

insert into public.fraud_cases (id, transaction_id, status, assigned_to, priority, notes, resolution, created_at, updated_at)
select
  gen_random_uuid(),
  t.id,
  case
    when row_number() over (order by t.risk_score desc) = 1 then 'open'::public.fraud_case_status
    when row_number() over (order by t.risk_score desc) = 2 then 'investigating'::public.fraud_case_status
    when row_number() over (order by t.risk_score desc) = 3 then 'confirmed_fraud'::public.fraud_case_status
    when row_number() over (order by t.risk_score desc) = 4 then 'false_positive'::public.fraud_case_status
    else 'closed'::public.fraud_case_status
  end,
  case when row_number() over (order by t.risk_score desc) % 2 = 0 then '22222222-2222-2222-2222-222222222222'::uuid else '33333333-3333-3333-3333-333333333333'::uuid end,
  case
    when t.risk_score >= 85 then 'critical'::public.fraud_case_priority
    when t.risk_score >= 65 then 'high'::public.fraud_case_priority
    when t.risk_score >= 40 then 'medium'::public.fraud_case_priority
    else 'low'::public.fraud_case_priority
  end,
  jsonb_build_array(
    jsonb_build_object('by', 'system', 'message', 'Case auto-created from scoring threshold.', 'at', t.created_at),
    jsonb_build_object('by', 'analyst', 'message', 'Initial review started.', 'at', t.created_at + interval '30 minute')
  ),
  case when row_number() over (order by t.risk_score desc) = 4 then 'Verified loyal customer after manual review.' else null end,
  t.created_at,
  t.created_at + interval '1 hour'
from (
  select * from public.transactions where risk_score >= 58 order by risk_score desc limit 8
) t
left join public.fraud_cases fc on fc.transaction_id = t.id
where fc.transaction_id is null;

insert into public.alerts (id, type, severity, title, message, transaction_id, is_read, created_at)
select
  gen_random_uuid(),
  case
    when t.status = 'declined' then 'transaction_declined'
    when t.risk_score > 75 then 'risk_threshold_exceeded'
    else 'velocity_spike'
  end,
  case when t.risk_score > 75 then 'critical'::public.alert_severity else 'warning'::public.alert_severity end,
  case
    when t.status = 'declined' then 'Declined transaction alert'
    when t.risk_score > 75 then 'Critical score alert'
    else 'Velocity alert'
  end,
  'Transaction ' || t.external_transaction_id || ' scored ' || t.risk_score || ' and requires attention.',
  t.id,
  false,
  t.created_at + interval '10 minute'
from (
  select * from public.transactions where status in ('declined', 'review') order by risk_score desc limit 10
) t
where not exists (
  select 1 from public.alerts a where a.transaction_id = t.id
);
