import { NextResponse } from 'next/server';
import { executeDecadeJudgment } from '@/lib/adapt-cycle';
import { notifyDecadeJudgmentToCEO, notifyDecadeJudgmentToAdminChannel } from '@/lib/slack-notifier';

export async function GET(request: Request) {
  try {
    // 🔐 セキュリティ強化: Vercel Cron専用ヘッダーチェック + Bearer token
    const vercelCronHeader = request.headers.get('x-vercel-cron');
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Vercel Cronからのリクエストでない、または認証トークンが一致しない場合は拒否
    if (!vercelCronHeader || !process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      console.warn('⚠️ 不正なCronアクセス試行を検出:', {
        hasVercelHeader: !!vercelCronHeader,
        hasToken: !!token,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
