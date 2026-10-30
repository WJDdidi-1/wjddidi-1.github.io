CREATE TRIGGER analytics_rollup_after_insert
AFTER INSERT ON analytics_events
BEGIN
 INSERT INTO analytics_daily(day,country,views) VALUES(NEW.day,NEW.country,1)
 ON CONFLICT(day,country) DO UPDATE SET views=analytics_daily.views+1;
END;
