# BACKEND ARCHITECTURE

autoVerify.js

Purpose:

- grading engine
- cron every 5 min
- settles picks
- updates:
    - ROI
    - PnL
    - CLV
    - Sharp Score
    - ELO
    - Reliability
    - Division
    - Streak

---

backend-odds-api.js

Purpose:

- The Odds API provider
- cache layer
- fixtures fallback
- provider normalization

---

backend-rankings-engine.js

Purpose:

- leaderboard
- rankings
- divisions
- rank history
- recent picks cache

---

backend-profile-endpoints.js

Purpose:

- profile persistence
- avatar
- banner
- borders
- identity

---

backend-ws-events.js

Purpose:

- live websocket events
- online count
- division updates
- streak updates
- pick updates

---

notifications-system.js

Purpose:

- push notifications
- badge notifications
- live notifications