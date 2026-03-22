# 🤖 UptimeRobot Setup Guide

## Overview
Set up free monitoring for your Fixr app using UptimeRobot to ensure it's always running and get notified when it goes down.

## Quick Setup

### 1. Create UptimeRobot Account
1. Go to [https://uptimerobot.com/](https://uptimerobot.com/)
2. Sign up for a free account
3. Free plan includes:
   - 50 monitors
   - 5-minute intervals
   - Email alerts
   - SMS alerts (limited)

### 2. Create HTTP Monitor

#### Basic Settings:
- **Monitor Type**: HTTP(s)
- **Friendly Name**: Fixr App - Production
- **URL (or IP)**: `https://your-app.vercel.app/api/health`
- **Monitoring Interval**: 5 minutes (free plan default)

#### Advanced Settings:
- **HTTP Method**: GET
- **Timeout**: 30 seconds
- **Monitor Type**: Keyword Exists
- **Keyword**: `"status":"healthy"` (checks for healthy status in response)

#### Alert Contacts:
- **Email**: Add your email address
- **SMS**: Add your phone number (optional, limited on free plan)
- **Webhook**: Add Slack/Discord webhook (optional)

### 3. Create Additional Monitors

#### Monitor 2: Homepage
- **URL**: `https://your-app.vercel.app/`
- **Keyword**: `Fixr` (checks if homepage loads)

#### Monitor 3: API Health
- **URL**: `https://your-app.vercel.app/api/health/database`
- **Keyword**: `"status":"connected"`

#### Monitor 4: GitHub Webhook
- **URL**: `https://your-app.vercel.app/api/webhook/github`
- **HTTP Method**: HEAD (faster, doesn't process webhook)

### 4. Configure Alert Settings

#### Alert Thresholds:
- **Check failures before alert**: 2 (to avoid false alarms)
- **Check successes before OK**: 1

#### Maintenance Windows:
- Set up maintenance windows for planned deployments
- Add your deployment schedule (e.g., Sundays 2-4 AM)

#### Rate Limits:
- **Email alerts**: Maximum 1 per hour
- **SMS alerts**: Maximum 1 per day (free plan limit)

### 5. Public Status Page (Optional)

UptimeRobot provides a free public status page:

1. Go to "My Settings" → "Public Status Pages"
2. Click "Add New Status Page"
3. Select monitors to include
4. Customize branding and colors
5. Get your public URL: `https://stats.uptimerobot.com/your-id`

**Example URL**: `https://stats.uptimerobot.com/123456789`

### 6. Advanced Monitoring

#### Response Time Monitoring:
- Enable response time tracking
- Set up alerts for slow responses (>5 seconds)

#### SSL Certificate Monitoring:
- Monitor SSL certificate expiry
- Get alerts 30 days before expiry

#### Domain Monitoring:
- Monitor domain expiry
- Monitor DNS records

## Integration with Fixr

### Add Status Badge to Your App

Add this to your footer or status page:

```html
<a href="https://stats.uptimerobot.com/your-status-page-id">
  <img src="https://img.shields.io/uptimerobot/status/monitor-id" alt="Fixr Status">
</a>
```

### Custom Webhook Integration

Create a custom webhook to log uptime events:

```typescript
// Add to /api/webhooks/uptime.ts
export async function POST(req: Request) {
  const data = await req.json()
  
  // Log uptime events
  console.log('UptimeRobot webhook:', data)
  
  // You could store this in your database
  // or send notifications to your team
  
  return Response.json({ received: true })
}
```

## Alternative Monitoring Services

### Free Alternatives:
- **Pingdom** (14-day free trial)
- **StatusCake** (free tier with limitations)
- **Better Uptime** (free forever, 20 monitors)

### Self-Hosted Options:
- **Uptime Kuma** (Docker-based, free)
- **Statping** (Open source)
- **Cachet** (Open source status page)

## Best Practices

### Monitor Selection:
1. **Health Endpoint** - Most reliable, checks backend
2. **Homepage** - Checks frontend and CDN
3. **API Endpoint** - Checks specific functionality
4. **Database Health** - Checks database connectivity

### Alert Configuration:
1. **Escalation**: Email → SMS → Phone call
2. **Time-based**: Different alerts for business hours vs after hours
3. **Severity**: Critical vs non-critical issues

### Maintenance:
1. **Scheduled Maintenance**: Use maintenance windows
2. **Manual Pauses**: Pause monitors during deployments
3. **Regular Review**: Check monitor effectiveness monthly

## Troubleshooting

### False Alarms:
- Increase check failures threshold
- Add keyword validation
- Check monitoring interval

### Missing Alerts:
- Verify alert contact information
- Check spam filters
- Review rate limiting settings

### Performance Issues:
- Monitor response times
- Check geographic distribution
- Consider multiple monitoring locations

## Automation

### API Integration:

```bash
# Get all monitors
curl -X GET "https://api.uptimerobot.com/v2/getMonitors" \
  -H "Cache-Control: no-cache" \
  -d "api_key=YOUR_API_KEY"

# Create new monitor
curl -X POST "https://api.uptimerobot.com/v2/newMonitor" \
  -H "Cache-Control: no-cache" \
  -d "api_key=YOUR_API_KEY" \
  -d "type=1" \
  -d "url=https://your-app.vercel.app/api/health" \
  -d "friendly_name=Fixr Health Check"
```

### Automated Deployment Scripts:

```bash
#!/bin/bash
# Pause monitors during deployment
MONITOR_ID="123456789"
API_KEY="your_api_key"

# Pause monitor
curl -X POST "https://api.uptimerobot.com/v2/editMonitor" \
  -d "api_key=$API_KEY" \
  -d "id=$MONITOR_ID" \
  -d "status=0"

# Deploy your app
npm run build && npm run deploy

# Resume monitoring
curl -X POST "https://api.uptimerobot.com/v2/editMonitor" \
  -d "api_key=$API_KEY" \
  -d "id=$MONITOR_ID" \
  -d "status=1"
```

## Summary

With UptimeRobot set up, you'll get:
✅ **24/7 monitoring** of your Fixr app
✅ **Instant alerts** when something goes wrong  
✅ **Public status page** for transparency
✅ **Historical uptime data** for analysis
✅ **Performance metrics** and response times

**Setup Time**: 10 minutes
**Cost**: Free
**Coverage**: 50 monitors, 5-minute intervals

This ensures your Fixr app stays reliable and you're immediately notified of any issues! 🚀
