# SPLIT Game - Supabase Database Schema

This directory contains the database migrations for the SPLIT SocialFi staking game.

## Overview

The SPLIT game uses a commit-reveal mechanism where players make daily choices to either "Split" (cooperate) or "Steal" (defect) in a game theory scenario. The database schema supports:

- User profiles and statistics
- Daily choice commit-reveal mechanism
- Squad/team functionality
- Community pot tracking
- Leaderboards and rankings

## Migration Files

### 001_create_profiles_table.sql
Creates the `profiles` table for user information:
- Stores wallet addresses, handles, avatars, and bios
- Includes RLS policies for user privacy
- Auto-generates updated_at timestamps

### 002_create_user_stats_table.sql
Creates the `user_stats` table for game statistics:
- Tracks splits, steals, streaks, win rates, and payouts
- Auto-calculates win rates on updates
- Includes performance indexes for leaderboards

### 003_create_daily_choices_table.sql
Creates the `daily_choices` table for the commit-reveal mechanism:
- Enforces timing constraints (commit phase vs reveal phase)
- Validates choice integrity
- Supports squad sync functionality

### 004_create_squads_table.sql
Creates the `squads` table for team functionality:
- Auto-generates URL-friendly slugs
- Supports public/private squads
- Includes member limits and metadata

### 005_create_squad_members_table.sql
Creates the `squad_members` table for squad membership:
- Role-based permissions (member, moderator, leader, admin)
- Enforces squad member limits
- Auto-adds squad creators as admins

### 006_create_community_pot_events_table.sql
Creates the `community_pot_events` table for pot tracking:
- Immutable event log for transparency
- Supports contributions, claims, and rollovers
- Includes balance calculation functions

### 007_create_views_and_functions.sql
Creates useful views and utility functions:
- Enhanced user stats with profile information
- Squad statistics and sync rates
- Daily game summaries
- Leaderboard views with rankings
- RPC functions for client access

## Key Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can read public data (leaderboards, public squads)
- Users can only modify their own data
- Squad members can access squad-specific data
- System role can perform administrative operations

### Commit-Reveal Mechanism
The daily choices table enforces proper timing:
- Commits only allowed in first 12 hours (00:00-11:59 UTC)
- Reveals only allowed in last 12 hours (12:00-23:59 UTC)
- Prevents front-running and ensures fair play

### Squad Functionality
Comprehensive squad system:
- Public and private squads
- Role-based permissions
- Member limits and auto-management
- Squad sync tracking for coordination

### Community Pot
Transparent pot management:
- Immutable event log
- Real-time balance calculations
- Support for various event types
- Daily statistics and reporting

## Usage

### Running Migrations
Apply migrations in order using Supabase CLI:

```bash
supabase db reset
supabase db push
```

Or apply individually:
```bash
supabase db push --include-all
```

### Environment Setup
Ensure your Supabase project has:
- RLS enabled on all tables
- Appropriate authentication configured
- API keys properly set in environment variables

### Client Integration
The database is designed to work with the TypeScript client in `src/lib/db.ts`:
- Type-safe interfaces match table schemas
- RLS policies align with client permissions
- RPC functions provide optimized queries

## Security Considerations

### Authentication
- All operations require proper JWT claims
- Wallet addresses used as primary identifiers
- System operations require elevated permissions

### Data Integrity
- Foreign key constraints maintain referential integrity
- Check constraints validate data ranges
- Triggers enforce business logic

### Privacy
- Users control their own profile data
- Squad data accessible only to members
- Public data clearly separated from private

## Performance

### Indexes
Strategic indexes on:
- Frequently queried columns (wallet, day_unix)
- Sort columns for leaderboards
- Foreign key relationships

### Views
Materialized-style views for:
- Complex leaderboard calculations
- Squad statistics aggregation
- Daily game summaries

### Functions
Optimized functions for:
- Real-time balance calculations
- Squad sync statistics
- User stat updates

## Monitoring

Key metrics to monitor:
- Daily active users (from daily_choices)
- Squad participation rates
- Community pot growth
- Query performance on leaderboards

## Backup and Recovery

Important considerations:
- Community pot events are immutable - never delete
- User stats should be backed up before major updates
- Squad data includes member relationships - preserve integrity

## Development

When adding new features:
1. Create new migration file with sequential number
2. Add appropriate RLS policies
3. Update TypeScript interfaces in client code
4. Add necessary indexes for performance
5. Test with sample data

## Support

For issues with the database schema:
1. Check RLS policies if access is denied
2. Verify JWT claims are properly set
3. Ensure migrations are applied in order
4. Check Supabase logs for detailed errors
