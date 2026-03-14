select * from public.users order by created_at desc;
select * from public.merchants order by created_at desc;
select * from public.devices order by last_seen_at desc;
select * from public.transactions order by created_at desc limit 100;
select * from public.risk_scores order by created_at desc limit 100;
select * from public.risk_rules order by priority asc;
select * from public.fraud_cases order by updated_at desc;
select * from public.alerts order by created_at desc;
select * from public.payment_methods order by created_at desc;
select * from public.whitelists_blacklists order by created_at desc;

select merchant_id, count(*) as transactions, avg(risk_score)::numeric(10,2) as avg_risk
from public.transactions
group by merchant_id
order by transactions desc;

select status, priority, count(*) as cases
from public.fraud_cases
group by status, priority
order by priority, status;
