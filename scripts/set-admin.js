/**
 * 初期管理者設定スクリプト
 * 
 * 使い方:
 * node scripts/set-admin.js <email>
 * 
 * 例:
 * node scripts/set-admin.js ccfp0811@gmail.com
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Firebase Admin SDKの秘密鍵

// Firebase Admin初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function setAdmin(email) {
  try {
    console.log(`管理者設定を開始: ${email}`);
    
    // メールアドレスでユーザーを検索
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✓ ユーザーが見つかりました: UID=${userRecord.uid}`);
    
    // Firestoreのusersコレクションを更新
    await db.collection('users').doc(userRecord.uid).set({
      role: 'admin',
      status: 'approved',
      emailVerified: true,
    }, { merge: true });
    
    console.log(`✓ Firestoreを更新しました`);
    console.log(`\n管理者設定が完了しました！`);
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);
    console.log(`Status: approved`);
    console.log(`\n${email} で /admin/login からログインできます。`);
    
    process.exit(0);
  } catch (error) {
    console.error(`✗ エラーが発生しました:`, error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log(`\nヒント: このメールアドレスのユーザーが Firebase Authentication に存在しません。`);
      console.log(`先にユーザー登録を行うか、Firebase Consoleから手動でユーザーを作成してください。`);
    }
    
    process.exit(1);
  }
}

// コマンドライン引数から Email を取得
const email = process.argv[2];

if (!email) {
  console.error('エラー: メールアドレスを指定してください');
  console.log('\n使い方:');
  console.log('  node scripts/set-admin.js <email>');
  console.log('\n例:');
  console.log('  node scripts/set-admin.js ccfp0811@gmail.com');
  process.exit(1);
}

setAdmin(email);
