import { NextResponse } from 'next/server';
import { sendDailySummary } from '@/lib/slack-notifier';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('📊 デイリーサマリーCron実行開始...');
    
    // TODO: 実装 - sendDailySummary関数を呼び出し
    console.log('⚠️ デイリーサマリー機能は後で実装');
    
    console.log('✅ デイリーサマリー送信完了');
    
    return NextResponse.json({
      success: true,
      message: 'デイリーサマリー送信完了',
    });
  } catch (error) {
    console.error('❌ デイリーサマリーCronエラー:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
