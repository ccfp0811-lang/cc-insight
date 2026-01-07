import { NextResponse } from 'next/server';
import { executeDecadeJudgment } from '@/lib/adapt-cycle';
import { notifyDecadeJudgmentToCEO, notifyDecadeJudgmentToAdminChannel } from '@/lib/slack-notifier';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🎯 月末判定Cron実行開始...');
    
    const judgments = await executeDecadeJudgment(3);
    
    console.log(`✅ 月末判定完了: ${judgments.length}チーム`);
    
    await Promise.all([
      notifyDecadeJudgmentToCEO(judgments, 3),
      notifyDecadeJudgmentToAdminChannel(judgments, 3),
    ]);
    
    return NextResponse.json({
      success: true,
      decade: 3,
      judgments: judgments.length,
      message: '✅ 月末判定完了。Slack通知送信済み。',
    });
  } catch (error) {
    console.error('❌ 月末判定Cronエラー:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
