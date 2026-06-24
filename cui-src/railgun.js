// ==========================================
// レールガン 物理シミュレーター (Node.js)
// ==========================================

// --- 物理定数 ---
const MU_0 = 4 * Math.PI * Math.E - 7; // 真空の透磁率 (H/m)

// --- シミュレーション設定パラメータ ---
const config = {
    railLength: 2.0,      // レールの長さ (m)
    wireRadius: 0.005,    // レールの半径 r (m)
    railDistance: 0.02,   // レール間の中心距離 d (m)
    projectileMass: 0.01, // 弾体の質量 (kg) -> 10g
    current: 50000,       // 流す電流 (A) -> 50kA
    dt: 0.00001           // タイムステップ・デルタt (秒) -> 10マイクロ秒
};

// --- インダクタンス勾配 L' の計算 ---
// L' = (mu_0 / pi) * ln(d / r)
const L_prime = (MU_0 / Math.PI) * Math.log(config.railDistance / config.wireRadius);

// --- 初期状態 ---
let state = {
    time: 0.0,       // 経過時間 (s)
    position: 0.0,   // 位置 (m)
    velocity: 0.0,   // 速度 (m/s)
    acceleration: 0.0 // 加速度 (m/s^2)
};

console.log("=== レールガン シミュレーション開始 ===");
console.log(`レールの長さ: ${config.railLength} m`);
console.log(`弾体の質量: ${config.projectileMass * 1000} g`);
console.log(`印加電流: ${config.current / 1000} kA`);
console.log(`計算される L': ${L_prime.toExponential(4)} H/m`);
console.log("-----------------------------------------");
console.log("時間(ms)\t位置(m)\t\t速度(m/s)\t速度(km/h)");

// --- シミュレーションループ ---
// 弾体がレールの端に達するまで計算
while (state.position < config.railLength) {
    
    // 1. ローレンツ力の計算: F = 0.5 * L' * I^2
    const force = 0.5 * L_prime * Math.pow(config.current, 2);
    
    // 2. 加速度の計算: a = F / m
    state.acceleration = force / config.projectileMass;
    
    // 3. 速度の更新: v = v + a * dt
    state.velocity += state.acceleration * config.dt;
    
    // 4. 位置の更新: x = x + v * dt
    state.position += state.velocity * config.dt;
    
    // 5. 時間の更新
    state.time += config.dt;

    // 1ミリ秒（100ステップ）ごとにログを出力
    if (Math.round(state.time / config.dt) % 100 === 0) {
        const timeMs = (state.time * 1000).toFixed(1);
        const posX = state.position.toFixed(3);
        const velM = state.velocity.toFixed(1);
        const velKm = (state.velocity * 3.6).toFixed(1); // m/s から km/h に変換
        
        console.log(`${timeMs}\t\t${posX}\t\t${velM}\t\t${velKm}`);
    }

    // 万が一、無限ループに陥らないためのセーフティ（シミュレーション上の1秒）
    if (state.time > 1.0) {
        console.log("\n[警告] 制限時間を超過しました。");
        break;
    }
}

// --- 結果の出力 ---
console.log("-----------------------------------------");
console.log("=== シミュレーション結果 ===");
console.log(`総加速時間 : ${(state.time * 1000).toFixed(3)} ms`);
console.log(`銃口初速   : ${state.velocity.toFixed(2)} m/s (マッハ ${(state.velocity / 340).toFixed(2)})`);
console.log(`最高時速   : ${(state.velocity * 3.6).toFixed(2)} km/h`);