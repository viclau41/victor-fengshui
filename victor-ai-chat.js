// Victor AI 聊天助手 - 嵌入式版本
// 使用方法：在 </body> 前加入 <script src="victor-ai-chat.js"></script>

(function() {
    'use strict';

    // ========== 配置區域 ==========
    const CONFIG = {
        // Poe API 配置
        apiBackend: 'https://poe-api-backend.vercel.app',

        // ⚠️ 機器人名稱
        botName: 'Gemini-2.5-Flash-Lite',

        // 提示詞模板
        promptTemplate: function(userMessage) {
            return `你是「玄學小助手」，Victor 風水師的專業 AI 助理。你熱情、親切、樂於助人，擁有豐富的玄學知識。

【你的性格特點】
- 熱情主動，像一位懂玄學的好朋友
- 樂於分享玄學小知識和有趣資訊
- 回答詳細有內容（150-250字），不要太簡短
- 主動推薦適合客人的服務
- 結尾總是邀請客人繼續提問或預約

【玄學基礎知識 - 可主動分享】
- 五行：金木水火土相生相剋，影響運勢健康
- 八字：出生年月日時的天干地支，揭示人生軌跡
- 風水：環境氣場影響運勢，好風水帶來好運
- 擇日：選擇吉日辦事，事半功倍
- 改名：名字五行配合八字，可助運勢提升
- 流年運程：每年運勢不同，提早了解可趨吉避凶

【服務價目表 - 問價錢時必須報價！】
🏠 風水佈局（家居/寫字樓/廠房）：HK$8,800
   詳情：https://victorlau.myqnapcloud.com/inprice7.htm

🏢 樓宇評級：基本 HK$1,800｜現場 HK$2,800｜商業 HK$4,800起
   詳情：https://victorlau.myqnapcloud.com/inprice13.htm

📅 專業擇吉日（結婚/搬遷/開業）：HK$2,800
   詳情：https://victorlau.myqnapcloud.com/inprice9.htm

✏️ 專業改名：個人 HK$4,800｜商號/商標 HK$6,800
   詳情：https://victorlau.myqnapcloud.com/inprice10.htm

📱 手機號碼改運：HK$4,800
   詳情：https://victorlau.myqnapcloud.com/inprice6.htm

🔮 奇門遁甲擇時改運：HK$2,800
   詳情：https://victorlau.myqnapcloud.com/inprice11.htm

⭐ 2026/2027流年運程預測（約90分鐘）：HK$1,500
   詳情：https://victorlau.myqnapcloud.com/inprice12.htm

🎲 AI智慧起卦（大六壬/甲子易）：單次 HK$399｜超值套餐 HK$1,000（買3送2）
   立即體驗：https://hexagram-api.vercel.app/

💼 一般諮詢：原價 HK$1,000/小時 → 現享八八折 HK$880/小時

【回答方式】
1. 先回應客人問題，給予有價值的資訊或玄學知識
2. 如涉及服務，主動報價並附上網頁連結
3. 分享相關的玄學小知識，讓客人覺得有收穫
4. 主動推薦其他可能適合的服務
5. 結尾友善邀請：「想了解更多？歡迎繼續問我，或 WhatsApp 6188 3889 預約 Victor 師傅親自解答！」

【免費試用優惠 - 客人主動問才提供！】
當客人問「有冇免費」「有冇優惠」「可唔可以試下」「免費試用」等時，才告訴他們：
🎁 首次使用智慧起卦服務，可獲得 **3次免費起卦碼** 試用！
- 適用於 AI 智慧起卦服務（大六壬/甲子易）
- 只需 WhatsApp 6188 3889 說明想試用，即可獲得免費起卦碼
- 體驗網址：https://hexagram-api.vercel.app/
- 此優惠只限首次使用的新客人

⚠️ 注意：如果客人沒有主動問免費/優惠，不要主動提及這個免費試用！

【重要規則】
- 問價錢必須直接報價，不可說「請查詢」
- 不要推薦水晶、風水擺設等實體產品
- 使用繁體中文
- 語氣親切熱情，像朋友聊天
- 只有客人主動問免費/優惠時，才提及免費起卦碼

【Victor 師傅簡介】
超過20年專業經驗，精通八宅派、玄空飛星、紫微斗數、奇門遁甲、大六壬等。
地址：銅鑼灣希慎道8號裕景商業中心3樓
WhatsApp：6188 3889 / 66381789

客戶問題：${userMessage}`;
        }
    };

    // 載入 marked.js（用於 Markdown 渲染）
    const markedScript = document.createElement('script');
    markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    document.head.appendChild(markedScript);

    // 插入 CSS 樣式
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --victor-primary: #5D5CDE;
            --victor-primary-dark: #4a49b0;
            --victor-primary-light: #7876ff;
            --victor-secondary: #ff9900;
            --victor-success: #10b981;
        }

        .victor-chat-trigger {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--victor-primary) 0%, var(--victor-primary-light) 100%);
            box-shadow: 0 8px 32px rgba(93, 92, 222, 0.3);
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999999;
            border: 3px solid rgba(255, 255, 255, 0.3);
            touch-action: none;
            user-select: none;
        }

        .victor-chat-trigger:hover {
            box-shadow: 0 12px 48px rgba(93, 92, 222, 0.4);
        }

        .victor-chat-trigger.dragging {
            cursor: grabbing;
            box-shadow: 0 16px 64px rgba(93, 92, 222, 0.5);
            transform: scale(1.1);
        }

        .victor-chat-trigger.faded {
            opacity: 0.3;
            transition: opacity 0.5s ease;
        }

        .victor-chat-trigger .icon-close {
            display: none;
        }

        .victor-chat-trigger.active .icon-open {
            display: none;
        }

        .victor-chat-trigger.active .icon-close {
            display: block;
        }

        .victor-chat-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 20px;
            height: 20px;
            background: var(--victor-secondary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 700;
            border: 2px solid white;
            animation: victorPulse 2s infinite;
        }

        @keyframes victorPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }

        .victor-chat-window {
            position: fixed;
            top: 50%;
            right: 100px;
            transform: translateY(-50%);
            width: 400px;
            max-width: calc(100vw - 120px);
            height: 600px;
            max-height: calc(100vh - 100px);
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(93, 92, 222, 0.3);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 999998;
            animation: victorSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .victor-chat-window.active {
            display: flex;
        }

        @keyframes victorSlideUp {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .victor-chat-header {
            background: linear-gradient(135deg, var(--victor-primary) 0%, var(--victor-primary-light) 100%);
            color: white;
            padding: 1.25rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
            overflow: hidden;
        }

        .victor-chat-header::before {
            content: '☯';
            position: absolute;
            font-size: 120px;
            opacity: 0.05;
            right: -30px;
            top: -40px;
            transform: rotate(-15deg);
        }

        .victor-chat-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .victor-chat-info {
            flex: 1;
        }

        .victor-clear-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 10px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-shrink: 0;
            min-height: 48px;
            min-width: 90px;
            /* 增強手機觸控 */
            -webkit-tap-highlight-color: rgba(255, 87, 87, 0.3);
            touch-action: manipulation;
        }

        .victor-clear-btn:hover {
            background: rgba(255, 87, 87, 0.9);
            transform: scale(1.08);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .victor-clear-btn:active,
        .victor-clear-btn:focus {
            background: rgba(255, 87, 87, 0.95);
            transform: scale(0.95);
            box-shadow: 0 2px 8px rgba(255, 87, 87, 0.5);
        }

        .victor-chat-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .victor-chat-status {
            font-size: 13px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .victor-status-dot {
            width: 8px;
            height: 8px;
            background: var(--victor-success);
            border-radius: 50%;
            animation: victorBlink 2s infinite;
        }

        @keyframes victorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .victor-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .victor-chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .victor-chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        .victor-chat-messages::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }

        .victor-message {
            display: flex;
            gap: 0.75rem;
            animation: victorMessageSlide 0.3s ease-out;
        }

        @keyframes victorMessageSlide {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .victor-message.user {
            flex-direction: row-reverse;
        }

        .victor-message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .victor-message.user .victor-message-avatar {
            background: linear-gradient(135deg, var(--victor-secondary) 0%, #ffb84d 100%);
            color: white;
        }

        .victor-message.assistant .victor-message-avatar {
            background: linear-gradient(135deg, var(--victor-primary) 0%, var(--victor-primary-light) 100%);
            color: white;
        }

        .victor-message-bubble {
            max-width: 75%;
            padding: 0.875rem 1.125rem;
            border-radius: 16px;
            line-height: 1.6;
            font-size: 15px;
        }

        .victor-message.user .victor-message-bubble {
            background: white;
            color: #1f2937;
            border-bottom-right-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .victor-message.assistant .victor-message-bubble {
            background: white;
            color: #1f2937;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .victor-message-bubble h1,
        .victor-message-bubble h2,
        .victor-message-bubble h3 {
            font-size: 1em;
            font-weight: 600;
            color: var(--victor-primary);
            margin-top: 0.5em;
            margin-bottom: 0.3em;
        }

        .victor-message-bubble ul,
        .victor-message-bubble ol {
            margin-left: 1.2em;
            margin-top: 0.3em;
        }

        .victor-message-bubble strong {
            color: var(--victor-primary);
            font-weight: 600;
        }

        .victor-message-bubble p {
            margin: 0.5em 0;
        }

        .victor-message-bubble p:first-child {
            margin-top: 0;
        }

        .victor-message-bubble p:last-child {
            margin-bottom: 0;
        }

        .victor-typing-indicator {
            display: flex;
            gap: 0.375rem;
            padding: 0.5rem 0;
        }

        .victor-typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #6b7280;
            animation: victorTypingBounce 1.4s infinite;
        }

        .victor-typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .victor-typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes victorTypingBounce {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.4;
            }
            30% {
                transform: translateY(-8px);
                opacity: 1;
            }
        }

        .victor-welcome-message {
            text-align: center;
            padding: 2rem 1rem;
        }

        .victor-welcome-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: victorWelcomeFloat 3s ease-in-out infinite;
        }

        @keyframes victorWelcomeFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        .victor-welcome-text {
            font-size: 15px;
            color: #6b7280;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .victor-quick-questions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .victor-quick-btn {
            padding: 0.75rem 1rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            color: #1f2937;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .victor-quick-btn:hover {
            background: var(--victor-primary);
            color: white;
            border-color: var(--victor-primary);
            transform: translateX(4px);
        }

        .victor-chat-input-area {
            padding: 1rem 1.5rem;
            background: white;
            border-top: 1px solid #e5e7eb;
        }

        .victor-input-wrapper {
            display: flex;
            gap: 0.75rem;
            align-items: flex-end;
        }

        .victor-user-input {
            flex: 1;
            padding: 0.875rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            font-family: 'Noto Sans TC', sans-serif;
            resize: none;
            max-height: 100px;
            transition: all 0.2s;
            background: #f8f9fa;
        }

        .victor-user-input:focus {
            outline: none;
            border-color: var(--victor-primary);
            background: white;
        }

        .victor-send-btn {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, var(--victor-primary) 0%, var(--victor-primary-light) 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .victor-send-btn:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .victor-send-btn:active:not(:disabled) {
            transform: scale(0.95);
        }

        .victor-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .victor-error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 14px;
            border-left: 3px solid #dc2626;
        }

        @media (max-width: 480px) {
            .victor-chat-window {
                position: fixed;
                top: 0;
                bottom: 0;
                right: 0;
                left: 0;
                width: 100%;
                max-width: 100%;
                height: 100%;
                max-height: 100%;
                border-radius: 0;
                transform: none;
                /* iOS 安全區域 - 確保頂部內容可見 */
                padding-top: env(safe-area-inset-top, 0);
                padding-bottom: env(safe-area-inset-bottom, 0);
            }

            .victor-chat-header {
                /* 增加頂部間距確保垃圾筒可見 */
                padding-top: calc(1.25rem + env(safe-area-inset-top, 0));
                min-height: 70px;
            }

            .victor-clear-btn {
                /* 手機版更大的觸控區域 */
                min-height: 52px;
                min-width: 100px;
                padding: 0.875rem 1.5rem;
                font-size: 16px;
            }

            .victor-chat-trigger {
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                font-size: 24px;
            }

            .victor-message-bubble {
                max-width: 85%;
            }

            .victor-chat-input-area {
                /* iOS 底部安全區域 */
                padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
            }
        }
    `;
    document.head.appendChild(style);

    // 創建 HTML 結構
    const html = `
        <div class="victor-chat-trigger" id="victorChatTrigger">
            <span class="icon-open">🔮</span>
            <span class="icon-close">✕</span>
            <div class="victor-chat-badge">AI</div>
        </div>

        <div class="victor-chat-window" id="victorChatWindow">
            <div class="victor-chat-header">
                <div class="victor-chat-avatar">🔮</div>
                <div class="victor-chat-info">
                    <div class="victor-chat-title">Victor 玄學助手</div>
                    <div class="victor-chat-status">
                        <span class="victor-status-dot"></span>
                        <span>在線為您服務</span>
                    </div>
                </div>
                <button id="victorClearBtn" class="victor-clear-btn" title="清除對話">
                    <span>🗑️</span>
                    <span>清除</span>
                </button>
            </div>

            <div class="victor-chat-messages" id="victorChatMessages">
                <div class="victor-welcome-message">
                    <div class="victor-welcome-icon">🌟</div>
                    <div class="victor-welcome-text">
                        您好！我是 Victor 的智能助手<br>
                        專門解答風水玄學問題，並推薦合適的專業服務
                    </div>
                    <div class="victor-quick-questions">
                        <div class="victor-quick-btn" onclick="VictorAI.askQuestion('如何改善家居風水？')">
                            <span>🏠</span>
                            <span>如何改善家居風水？</span>
                        </div>
                        <div class="victor-quick-btn" onclick="VictorAI.askQuestion('如何預約命理分析？')">
                            <span>⭐</span>
                            <span>如何預約命理分析？</span>
                        </div>
                        <div class="victor-quick-btn" onclick="VictorAI.askQuestion('辦公室風水有什麼要注意？')">
                            <span>🏢</span>
                            <span>辦公室風水要注意什麼？</span>
                        </div>
                        <div class="victor-quick-btn" onclick="VictorAI.askQuestion('Victor 提供什麼服務？')">
                            <span>❓</span>
                            <span>Victor 提供什麼服務？</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="victor-chat-input-area">
                <div class="victor-input-wrapper">
                    <textarea
                        id="victorUserInput"
                        class="victor-user-input"
                        placeholder="輸入您的問題..."
                        rows="1"
                    ></textarea>
                    <button id="victorSendBtn" class="victor-send-btn">
                        ✈️
                    </button>
                </div>
            </div>
        </div>
    `;

    // 等待 DOM 載入完成後插入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.insertAdjacentHTML('beforeend', html);
            initVictorAI();
        });
    } else {
        document.body.insertAdjacentHTML('beforeend', html);
        initVictorAI();
    }

    // 初始化功能
    function initVictorAI() {
        let isProcessing = false;

        // 記憶配置
        const STORAGE_KEY = 'victorAI_conversation';
        const STORAGE_EXPIRY_DAYS = 30; // 一個月

        // 從 localStorage 載入對話記憶
        function loadConversationHistory() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (!stored) return [];

                const data = JSON.parse(stored);
                const now = new Date().getTime();

                // 檢查是否過期（超過30天）
                if (data.timestamp && (now - data.timestamp) > (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)) {
                    console.log('[Victor AI] 對話記錄已過期，自動清除');
                    localStorage.removeItem(STORAGE_KEY);
                    return [];
                }

                console.log('[Victor AI] 載入對話記錄:', data.history.length, '條');
                return data.history || [];
            } catch (e) {
                console.error('[Victor AI] 載入對話記錄失敗:', e);
                return [];
            }
        }

        // 保存對話記憶到 localStorage
        function saveConversationHistory(history) {
            try {
                const data = {
                    history: history,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                console.log('[Victor AI] 對話記錄已保存:', history.length, '條');
            } catch (e) {
                console.error('[Victor AI] 保存對話記錄失敗:', e);
            }
        }

        // 工具函數
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function scrollToBottom() {
            const messagesContainer = document.getElementById('victorChatMessages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // 對話記憶（從 localStorage 載入）
        let conversationHistory = loadConversationHistory();

        // 恢復歷史對話到 UI
        function restoreConversationUI() {
            if (conversationHistory.length === 0) return;

            const messagesContainer = document.getElementById('victorChatMessages');
            // 清除歡迎消息
            const welcome = messagesContainer.querySelector('.victor-welcome-message');
            if (welcome) {
                welcome.remove();
            }

            // 顯示所有歷史對話
            conversationHistory.forEach((item) => {
                if (item.role === 'user') {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'victor-message user';
                    messageDiv.innerHTML = `
                        <div class="victor-message-avatar">👤</div>
                        <div class="victor-message-bubble">${escapeHtml(item.content)}</div>
                    `;
                    messagesContainer.appendChild(messageDiv);
                } else {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'victor-message assistant';
                    let renderedContent = item.content;
                    if (window.marked) {
                        renderedContent = marked.parse(item.content);
                    }
                    messageDiv.innerHTML = `
                        <div class="victor-message-avatar">🔮</div>
                        <div class="victor-message-bubble">${renderedContent}</div>
                    `;
                    messagesContainer.appendChild(messageDiv);
                }
            });

            scrollToBottom();
            console.log('[Victor AI] 已恢復', conversationHistory.length, '條歷史對話');
        }

        // 初始化時恢復對話
        restoreConversationUI();

        // 拖動功能
        const trigger = document.getElementById('victorChatTrigger');
        const POSITION_KEY = 'victorAI_buttonPosition';
        let isDragging = false;
        let startX, startY, startLeft, startBottom;
        let hasMoved = false;
        let fadeTimer = null;

        // 自動透明功能：3秒後變為70%透明
        function startFadeTimer() {
            // 清除之前的定時器
            if (fadeTimer) {
                clearTimeout(fadeTimer);
            }

            // 移除透明類，恢復原色
            trigger.classList.remove('faded');

            // 3秒後自動變透明
            fadeTimer = setTimeout(() => {
                trigger.classList.add('faded');
            }, 3000);
        }

        // 當觸摸按鈕時恢復原色
        function resetFade() {
            trigger.classList.remove('faded');
            startFadeTimer();
        }

        // 頁面載入後啟動計時器
        startFadeTimer();

        // 載入保存的位置
        function loadButtonPosition() {
            try {
                const saved = localStorage.getItem(POSITION_KEY);
                if (saved) {
                    const pos = JSON.parse(saved);
                    trigger.style.bottom = pos.bottom + 'px';
                    trigger.style.right = pos.right + 'px';
                }
            } catch (e) {
                console.error('[Victor AI] 載入按鈕位置失敗:', e);
            }
        }

        // 保存位置
        function saveButtonPosition(bottom, right) {
            try {
                localStorage.setItem(POSITION_KEY, JSON.stringify({bottom, right}));
            } catch (e) {
                console.error('[Victor AI] 保存按鈕位置失敗:', e);
            }
        }

        // 載入保存的位置
        loadButtonPosition();

        // 鼠標/觸摸開始
        function onDragStart(e) {
            isDragging = true;
            hasMoved = false;
            trigger.classList.add('dragging');

            // 觸摸時恢復原色並重置定時器
            resetFade();

            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            // 獲取當前 right 和 bottom 值
            const computedStyle = window.getComputedStyle(trigger);
            startLeft = parseInt(computedStyle.right);
            startBottom = parseInt(computedStyle.bottom);

            e.preventDefault();
        }

        // 鼠標/觸摸移動
        function onDragMove(e) {
            if (!isDragging) return;

            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            // 如果移動超過5px，視為拖動而非點擊
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                hasMoved = true;
            }

            // 計算新位置（向右移動時 right 減小，向下移動時 bottom 減小）
            const newRight = Math.max(0, Math.min(window.innerWidth - trigger.offsetWidth, startLeft - deltaX));
            const newBottom = Math.max(0, Math.min(window.innerHeight - trigger.offsetHeight, startBottom - deltaY));

            trigger.style.right = newRight + 'px';
            trigger.style.bottom = newBottom + 'px';

            e.preventDefault();
        }

        // 鼠標/觸摸結束
        function onDragEnd(e) {
            if (isDragging) {
                isDragging = false;
                trigger.classList.remove('dragging');

                // 如果沒有移動，視為點擊
                if (!hasMoved) {
                    toggleChatWindow();
                } else {
                    // 保存位置
                    const bottom = parseInt(trigger.style.bottom);
                    const right = parseInt(trigger.style.right);
                    saveButtonPosition(bottom, right);
                }

                // 重置標記
                hasMoved = false;
            }
        }

        // 切換聊天窗口
        function toggleChatWindow() {
            const chatWindow = document.getElementById('victorChatWindow');
            chatWindow.classList.toggle('active');
            trigger.classList.toggle('active');

            if (chatWindow.classList.contains('active')) {
                document.getElementById('victorUserInput').focus();
            }
        }

        // 添加事件監聽器
        trigger.addEventListener('mousedown', onDragStart);
        trigger.addEventListener('touchstart', onDragStart, {passive: false});

        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('touchmove', onDragMove, {passive: false});

        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd);

        // 發送按鈕
        document.getElementById('victorSendBtn').addEventListener('click', sendMessage);

        // 清除按鈕
        document.getElementById('victorClearBtn').addEventListener('click', function() {
            // 清除對話歷史（記憶體和 localStorage）
            conversationHistory = [];
            localStorage.removeItem(STORAGE_KEY);

            // 清除 UI 顯示並恢復歡迎消息
            const messagesContainer = document.getElementById('victorChatMessages');
            messagesContainer.innerHTML = `
                <div class="victor-welcome-message">
                    <div class="victor-welcome-icon">🌟</div>
                    <div class="victor-welcome-text">
                        您好！我是 Victor 的智能助手<br>
                        專門解答風水玄學問題，並推薦合適的專業服務
                    </div>
                    <div class="victor-quick-questions">
                        <div class="victor-quick-btn" onclick="VictorAI.askQuestion('如何改善家居風水？')">
                            <span>🏠</span>
                            <span>如何改善家居風水？</span>
                        </div>
                        <div class="victor-quick-btn" onclick="VictorAI.askQuestion('如何預約命理分析？')">
                            <span>⭐</span>
                            <span>如何預約命理分析？</span>
                        </div>
                        <div class="victor-quick-btn" onclick="VictorAI.askQuestion('辦公室風水有什麼要注意？')">
                            <span>🏢</span>
                            <span>辦公室風水要注意什麼？</span>
                        </div>
                        <div class="victor-quick-btn" onclick="VictorAI.askQuestion('Victor 提供什麼服務？')">
                            <span>❓</span>
                            <span>Victor 提供什麼服務？</span>
                        </div>
                    </div>
                </div>
            `;

            console.log('[Victor AI] 對話已清除');
        });

        // 輸入框
        const userInput = document.getElementById('victorUserInput');
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });

        // 發送消息函數
        async function sendMessage() {
            const input = document.getElementById('victorUserInput');
            const message = input.value.trim();

            if (!message || isProcessing) return;

            displayUserMessage(message);
            input.value = '';
            input.style.height = 'auto';

            isProcessing = true;
            updateSendButton(true);
            displayLoadingMessage();

            try {
                // 構建包含歷史記憶的提示詞
                let contextPrompt = '';
                if (conversationHistory.length > 0) {
                    contextPrompt = '以下是對話歷史：\n';
                    conversationHistory.forEach((item, index) => {
                        contextPrompt += `${item.role === 'user' ? '客戶' : '助手'}：${item.content}\n`;
                    });
                    contextPrompt += '\n';
                }

                const prompt = CONFIG.promptTemplate(message);
                const fullPrompt = contextPrompt + prompt;

                console.log('[Victor AI] 發送請求到:', `${CONFIG.apiBackend}/api/chat`);
                console.log('[Victor AI] 使用模型:', CONFIG.botName);
                console.log('[Victor AI] 對話歷史數量:', conversationHistory.length);

                const response = await fetch(`${CONFIG.apiBackend}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: CONFIG.botName,
                        message: fullPrompt
                    })
                });

                console.log('[Victor AI] API 響應狀態:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[Victor AI] API 錯誤響應:', errorText);
                    throw new Error(`API 請求失敗 (${response.status}): ${errorText.substring(0, 100)}`);
                }

                const data = await response.json();
                console.log('[Victor AI] 收到數據:', data);
                removeLoadingMessage();

                let assistantResponse = '';
                if (data.response) {
                    assistantResponse = data.response;
                    displayAssistantMessage(data.response);
                } else if (data.text) {
                    assistantResponse = data.text;
                    displayAssistantMessage(data.text);
                } else {
                    console.error('[Victor AI] 無效的響應格式:', data);
                    throw new Error('無效的回應格式。API 返回: ' + JSON.stringify(data).substring(0, 100));
                }

                // 保存對話到記憶（不限制數量，保存一個月）
                conversationHistory.push({ role: 'user', content: message });
                conversationHistory.push({ role: 'assistant', content: assistantResponse });

                // 保存到 localStorage
                saveConversationHistory(conversationHistory);
            } catch (error) {
                console.error('[Victor AI] 完整錯誤:', error);
                removeLoadingMessage();

                let errorMessage = '抱歉，系統出現錯誤。';
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = '無法連接到 API 服務器。請檢查網絡連接或稍後再試。';
                } else {
                    errorMessage = error.message;
                }

                displayError(errorMessage + '\n\n請聯絡 Victor：\nWhatsApp: 6188 3889 / 66381789\n微信: victor3889');
            } finally {
                isProcessing = false;
                updateSendButton(false);
            }
        }

        function displayUserMessage(text) {
            const messagesContainer = document.getElementById('victorChatMessages');
            const welcome = messagesContainer.querySelector('.victor-welcome-message');
            if (welcome) {
                welcome.remove();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = 'victor-message user';
            messageDiv.innerHTML = `
                <div class="victor-message-avatar">👤</div>
                <div class="victor-message-bubble">${escapeHtml(text)}</div>
            `;

            messagesContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        function displayLoadingMessage() {
            const messagesContainer = document.getElementById('victorChatMessages');
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'victor-message assistant';
            loadingDiv.id = 'victorLoadingMessage';
            loadingDiv.innerHTML = `
                <div class="victor-message-avatar">🔮</div>
                <div class="victor-message-bubble">
                    <div class="victor-typing-indicator">
                        <div class="victor-typing-dot"></div>
                        <div class="victor-typing-dot"></div>
                        <div class="victor-typing-dot"></div>
                    </div>
                </div>
            `;

            messagesContainer.appendChild(loadingDiv);
            scrollToBottom();
        }

        function removeLoadingMessage() {
            const loading = document.getElementById('victorLoadingMessage');
            if (loading) {
                loading.remove();
            }
        }

        function displayAssistantMessage(content) {
            const messagesContainer = document.getElementById('victorChatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'victor-message assistant';

            // 使用 marked 渲染 Markdown（如果已載入）
            let renderedContent = content;
            if (window.marked) {
                renderedContent = marked.parse(content);
            }

            messageDiv.innerHTML = `
                <div class="victor-message-avatar">🔮</div>
                <div class="victor-message-bubble">${renderedContent}</div>
            `;

            messagesContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        function displayError(errorText) {
            const messagesContainer = document.getElementById('victorChatMessages');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'victor-message assistant';
            errorDiv.innerHTML = `
                <div class="victor-message-avatar">⚠️</div>
                <div class="victor-message-bubble">
                    <div class="victor-error-message">${escapeHtml(errorText)}</div>
                </div>
            `;

            messagesContainer.appendChild(errorDiv);
            scrollToBottom();
        }

        function updateSendButton(processing) {
            const btn = document.getElementById('victorSendBtn');
            btn.disabled = processing;
            btn.textContent = processing ? '⏳' : '✈️';
        }

        // 全域函數供快速提問使用
        window.VictorAI = {
            askQuestion: function(question) {
                document.getElementById('victorUserInput').value = question;
                sendMessage();
            }
        };
    }
})();
