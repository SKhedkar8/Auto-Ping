import { NextResponse } from 'next/server';
import { runReminderJob } from '@/lib/db';

export async function POST() {
  try {
    const result = runReminderJob();
    return NextResponse.json({
      success: true,
      message: `Reminder engine run complete. Triggered ${result.triggeredCount} notifications.`,
      details: result.messages,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
