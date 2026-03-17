// Victor AI Chat Assistant - Multilingual Embedded Version
// Usage: Add <script src="victor-ai-chat.js"></script> before </body>

(function() {
    'use strict';

    // ========== Language Detection & i18n ==========
    function detectLanguage() {
        // 1. Check HTML lang attribute
        var htmlLang = (document.documentElement.lang || '').toLowerCase();
        if (htmlLang.startsWith('ko')) return 'ko';
        if (htmlLang.startsWith('ja')) return 'ja';
        if (htmlLang.startsWith('en')) return 'en';
        if (htmlLang.startsWith('zh')) return 'zh-TW';

        // 2. Check browser language
        var navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (navLang.startsWith('ko')) return 'ko';
        if (navLang.startsWith('ja')) return 'ja';
        if (navLang.startsWith('en')) return 'en';
        if (navLang.startsWith('zh-cn') || navLang === 'zh-hans') return 'zh-CN';

        return 'zh-TW'; // default
    }

    var currentLang = detectLanguage();

    // UI text translations
    var LANG_UI = {
        'zh-TW': {
            chatTitle: 'Victor 玄學助手',
            statusOnline: '在線為您服務',
            clearBtn: '清除',
            clearTitle: '清除對話',
            welcomeText: '您好！我是 Victor 的智能助手<br>專門解答風水玄學問題，並推薦合適的專業服務',
            placeholder: '輸入您的問題...',
            quickQ1: '如何改善家居風水？',
            quickQ2: '如何預約命理分析？',
            quickQ3: '辦公室風水要注意什麼？',
            quickQ4: 'Victor 提供什麼服務？',
            errorGeneric: '抱歉，系統出現錯誤。',
            errorNetwork: '無法連接到 API 服務器。請檢查網絡連接或稍後再試。',
            errorContact: '\n\n請聯絡 Victor：\nWhatsApp: 6188 3889 / 66381789\n微信: victor3889'
        },
        'zh-CN': {
            chatTitle: 'Victor 玄学助手',
            statusOnline: '在线为您服务',
            clearBtn: '清除',
            clearTitle: '清除对话',
            welcomeText: '您好！我是 Victor 的智能助手<br>专门解答风水玄学问题，并推荐合适的专业服务',
            placeholder: '输入您的问题...',
            quickQ1: '如何改善家居风水？',
            quickQ2: '如何预约命理分析？',
            quickQ3: '办公室风水要注意什么？',
            quickQ4: 'Victor 提供什么服务？',
            errorGeneric: '抱歉，系统出现错误。',
            errorNetwork: '无法连接到 API 服务器。请检查网络连接或稍后再试。',
            errorContact: '\n\n请联系 Victor：\nWhatsApp: 6188 3889 / 66381789\n微信: victor3889'
        },
        'en': {
            chatTitle: 'Victor AI Assistant',
            statusOnline: 'Online - Ready to help',
            clearBtn: 'Clear',
            clearTitle: 'Clear conversation',
            welcomeText: 'Hello! I\'m Victor\'s AI assistant.<br>I specialize in Feng Shui, divination, and metaphysical consultations.',
            placeholder: 'Type your question...',
            quickQ1: 'How to improve home Feng Shui?',
            quickQ2: 'How to book a consultation?',
            quickQ3: 'Office Feng Shui tips?',
            quickQ4: 'What services does Victor offer?',
            errorGeneric: 'Sorry, a system error occurred.',
            errorNetwork: 'Unable to connect to the server. Please check your network or try again later.',
            errorContact: '\n\nContact Victor:\nWhatsApp: +852 6188 3889 / +852 6638 1789\nWeChat: victor3889'
        },
        'ko': {
            chatTitle: 'Victor AI 어시스턴트',
            statusOnline: '온라인 - 상담 가능',
            clearBtn: '삭제',
            clearTitle: '대화 삭제',
            welcomeText: '안녕하세요! Victor의 AI 어시스턴트입니다.<br>풍수, 점술, 사주 등 전문 상담을 도와드립니다.',
            placeholder: '질문을 입력하세요...',
            quickQ1: '집 풍수를 개선하는 방법은?',
            quickQ2: '상담 예약은 어떻게 하나요?',
            quickQ3: '사무실 풍수 주의사항은?',
            quickQ4: 'Victor의 서비스는 무엇인가요?',
            errorGeneric: '죄송합니다, 시스템 오류가 발생했습니다.',
            errorNetwork: '서버에 연결할 수 없습니다. 네트워크를 확인하거나 나중에 다시 시도해 주세요.',
            errorContact: '\n\nVictor 연락처:\nWhatsApp: +852 6188 3889 / +852 6638 1789\nWeChat: victor3889'
        },
        'ja': {
            chatTitle: 'Victor AI アシスタント',
            statusOnline: 'オンライン - ご相談承ります',
            clearBtn: 'クリア',
            clearTitle: '会話をクリア',
            welcomeText: 'こんにちは！Victorの AIアシスタントです。<br>風水・占い・運命学のご相談を承ります。',
            placeholder: 'ご質問を入力してください...',
            quickQ1: '自宅の風水を改善するには？',
            quickQ2: '鑑定の予約方法は？',
            quickQ3: 'オフィスの風水で注意すべき点は？',
            quickQ4: 'Victorのサービス内容は？',
            errorGeneric: '申し訳ございません、システムエラーが発生しました。',
            errorNetwork: 'サーバーに接続できません。ネットワークをご確認いただくか、後ほどお試しください。',
            errorContact: '\n\nVictor連絡先:\nWhatsApp: +852 6188 3889 / +852 6638 1789\nWeChat: victor3889'
        }
    };

    function t(key) {
        var lang = LANG_UI[currentLang] || LANG_UI['en'];
        return lang[key] || LANG_UI['en'][key] || key;
    }

    // ========== Config ==========
    var CONFIG = {
        apiBackend: 'https://poe-api-backend.vercel.app',
        botName: 'Gemini-2.5-Flash-Lite',

        promptTemplate: function(userMessage) {
            // Detect response language instruction
            var langInstruction = {
                'zh-TW': '請使用繁體中文回答。語氣親切熱情，像朋友聊天。',
                'zh-CN': '请使用简体中文回答。语气亲切热情，像朋友聊天。',
                'en': 'Please respond in English. Be warm, friendly, and professional.',
                'ko': '한국어로 답변해 주세요. 따뜻하고 친절하며 전문적으로 답변해 주세요.',
                'ja': '日本語でお答えください。丁寧で親しみやすい口調でお願いします。'
            };

            var closingLine = {
                'zh-TW': '「想了解更多？歡迎繼續問我，或 WhatsApp 6188 3889 預約 Victor 師傅親自解答！」',
                'zh-CN': '"想了解更多？欢迎继续问我，或 WhatsApp 6188 3889 预约 Victor 师傅亲自解答！"',
                'en': '"Want to learn more? Feel free to ask, or WhatsApp +852 6188 3889 to book a personal consultation with Master Victor!"',
                'ko': '"더 알고 싶으시면 계속 질문하시거나, WhatsApp +852 6188 3889로 Victor 선생님과 직접 상담을 예약하세요!"',
                'ja': '"詳しくはお気軽にご質問ください。WhatsApp +852 6188 3889 でVictor先生との直接鑑定をご予約いただけます！"'
            };

            var freeTrialTexts = {
                'zh-TW': '當客人問「有冇免費」「有冇優惠」「可唔可以試下」「免費試用」等時，才告訴他們：\n🎁 首次使用智慧起卦服務，可獲得 **3次免費起卦碼** 試用！\n- 只需 WhatsApp 6188 3889 說明想試用\n- 體驗網址：https://hexagram-api.vercel.app/\n- 此優惠只限首次使用的新客人\n⚠️ 如果客人沒有主動問免費/優惠，不要主動提及！',
                'zh-CN': '当客人问"有没有免费""有没有优惠""可以试试吗""免费试用"等时，才告诉他们：\n🎁 首次使用智慧起卦服务，可获得 **3次免费起卦码** 试用！\n- 只需 WhatsApp 6188 3889 说明想试用\n- 体验网址：https://hexagram-api.vercel.app/\n- 此优惠仅限首次使用的新客人\n⚠️ 如果客人没有主动问免费/优惠，不要主动提及！',
                'en': 'Only when the client asks about "free", "trial", "discount", "promotion", etc., tell them:\n🎁 First-time users can get **3 free divination codes** to try!\n- Just WhatsApp +852 6188 3889 to request a trial\n- Try it at: https://hexagram-api.vercel.app/\n- This offer is for first-time users only\n⚠️ Do NOT mention this offer unless the client asks about free/discounts!',
                'ko': '고객이 "무료", "할인", "체험" 등을 물어볼 때만 알려주세요:\n🎁 첫 이용 시 **무료 점괘 코드 3회** 제공!\n- WhatsApp +852 6188 3889로 체험 요청\n- 체험: https://hexagram-api.vercel.app/\n- 첫 이용 고객만 해당\n⚠️ 고객이 먼저 무료/할인을 묻지 않으면 언급하지 마세요!',
                'ja': 'お客様が「無料」「割引」「お試し」等を聞いた場合のみお伝えください：\n🎁 初回利用で**無料占いコード3回分**をプレゼント！\n- WhatsApp +852 6188 3889 でお試し申込\n- 体験: https://hexagram-api.vercel.app/\n- 初回のお客様限定\n⚠️ お客様が聞かない限り、この特典に触れないでください！'
            };

            var li = langInstruction[currentLang] || langInstruction['en'];
            var cl = closingLine[currentLang] || closingLine['en'];
            var ft = freeTrialTexts[currentLang] || freeTrialTexts['en'];

            return 'You are "Victor\'s Metaphysics Assistant", a professional AI assistant for Victor Fengshui & Divination. You are warm, friendly, knowledgeable, and helpful.\n\n' +
                '【Language Instruction】\n' + li + '\n\n' +
                '【Your Personality】\n' +
                '- Warm and proactive, like a knowledgeable friend\n' +
                '- Love sharing interesting metaphysical knowledge\n' +
                '- Give detailed, valuable responses (150-250 words), not too brief\n' +
                '- Proactively recommend suitable services\n' +
                '- Always end with an invitation to continue chatting or book a consultation\n\n' +
                '【Metaphysical Knowledge - Share Proactively】\n' +
                '- Five Elements (五行): Metal, Wood, Water, Fire, Earth - their cycles affect fortune and health\n' +
                '- Bazi (八字): The Four Pillars of birth time reveal life trajectory\n' +
                '- Feng Shui (風水): Environmental energy affects fortune; good Feng Shui brings good luck\n' +
                '- Date Selection (擇日): Choosing auspicious dates for important events\n' +
                '- Name Analysis (改名): Names aligned with Bazi elements can boost fortune\n' +
                '- Annual Fortune (流年運程): Each year brings different fortune; early knowledge helps planning\n\n' +
                '【Service Price List - MUST quote prices when asked!】\n' +
                '🏠 Feng Shui Layout (Home/Office/Factory): HK$8,800\n' +
                '   Details: https://victor-fengshui.vercel.app/inprice7.html\n\n' +
                '🏢 Property Rating: Basic HK$1,800 | On-site HK$2,800 | Commercial from HK$4,800\n' +
                '   Details: https://victor-fengshui.vercel.app/inprice13.html\n\n' +
                '📅 Auspicious Date Selection (Wedding/Moving/Business): HK$2,800\n' +
                '   Details: https://victor-fengshui.vercel.app/inprice9.html\n\n' +
                '✏️ Name Analysis: Personal HK$4,800 | Business/Trademark HK$6,800\n' +
                '   Details: https://victor-fengshui.vercel.app/inprice10.html\n\n' +
                '📱 Lucky Phone Number Change: HK$4,800\n' +
                '   Details: https://victor-fengshui.vercel.app/inprice6.html\n\n' +
                '🔮 Qi Men Dun Jia Luck Enhancement: HK$2,800\n' +
                '   Details: https://victor-fengshui.vercel.app/inprice11.html\n\n' +
                '⭐ 2026/2027 Annual Fortune Forecast (~90 min): HK$1,500\n' +
                '   Details: https://victor-fengshui.vercel.app/inprice12.html\n\n' +
                '🎲 AI I-Ching Divination (Liu Ren/Jiazi Yi): Single HK$399 | Bundle HK$1,000 (Buy 3 Get 2 Free)\n' +
                '   Try now: https://hexagram-api.vercel.app/\n\n' +
                '💼 General Consultation: Was HK$1,000/hr → Now 12% off at HK$880/hr\n\n' +
                '【Response Guidelines】\n' +
                '1. First answer the client\'s question with valuable info or metaphysical knowledge\n' +
                '2. If relevant, quote the price and include the service link\n' +
                '3. Share related metaphysical insights\n' +
                '4. Proactively recommend other suitable services\n' +
                '5. End with a friendly invitation: ' + cl + '\n\n' +
                '【Free Trial Offer - Only when asked!】\n' + ft + '\n\n' +
                '【Important Rules】\n' +
                '- MUST quote prices directly when asked, never say "please inquire"\n' +
                '- Do NOT recommend crystals, Feng Shui ornaments, or physical products\n' +
                '- Only mention the free trial when the client asks about free/discounts\n\n' +
                '【About Victor】\n' +
                '20+ years of professional experience. Expert in Ba Zhai, Xuan Kong Flying Stars, Zi Wei Dou Shu, Qi Men Dun Jia, Da Liu Ren, and more.\n' +
                'Address: 3/F, Prospect Commercial Building, 8 Hysan Avenue, Causeway Bay, Hong Kong\n' +
                'WhatsApp: +852 6188 3889 / +852 6638 1789\n\n' +
                'Client Question: ' + userMessage;
        }
    };

    // Load marked.js for Markdown rendering
    var markedScript = document.createElement('script');
    markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    document.head.appendChild(markedScript);

    // Insert CSS styles
    var style = document.createElement('style');
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
                padding-top: env(safe-area-inset-top, 0);
                padding-bottom: env(safe-area-inset-bottom, 0);
            }

            .victor-chat-header {
                padding-top: calc(1.25rem + env(safe-area-inset-top, 0));
                min-height: 70px;
            }

            .victor-clear-btn {
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
                padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
            }
        }
    `;
    document.head.appendChild(style);

    // Build welcome HTML with current language
    function buildWelcomeHTML() {
        return '<div class="victor-welcome-message">' +
            '<div class="victor-welcome-icon">🌟</div>' +
            '<div class="victor-welcome-text">' + t('welcomeText') + '</div>' +
            '<div class="victor-quick-questions">' +
                '<div class="victor-quick-btn" onclick="VictorAI.askQuestion(\'' + t('quickQ1').replace(/'/g, "\\'") + '\')">' +
                    '<span>🏠</span><span>' + t('quickQ1') + '</span></div>' +
                '<div class="victor-quick-btn" onclick="VictorAI.askQuestion(\'' + t('quickQ2').replace(/'/g, "\\'") + '\')">' +
                    '<span>⭐</span><span>' + t('quickQ2') + '</span></div>' +
                '<div class="victor-quick-btn" onclick="VictorAI.askQuestion(\'' + t('quickQ3').replace(/'/g, "\\'") + '\')">' +
                    '<span>🏢</span><span>' + t('quickQ3') + '</span></div>' +
                '<div class="victor-quick-btn" onclick="VictorAI.askQuestion(\'' + t('quickQ4').replace(/'/g, "\\'") + '\')">' +
                    '<span>❓</span><span>' + t('quickQ4') + '</span></div>' +
            '</div></div>';
    }

    // Build main HTML
    var html = '<div class="victor-chat-trigger" id="victorChatTrigger">' +
            '<span class="icon-open">🔮</span>' +
            '<span class="icon-close">✕</span>' +
            '<div class="victor-chat-badge">AI</div>' +
        '</div>' +
        '<div class="victor-chat-window" id="victorChatWindow">' +
            '<div class="victor-chat-header">' +
                '<div class="victor-chat-avatar">🔮</div>' +
                '<div class="victor-chat-info">' +
                    '<div class="victor-chat-title">' + t('chatTitle') + '</div>' +
                    '<div class="victor-chat-status">' +
                        '<span class="victor-status-dot"></span>' +
                        '<span>' + t('statusOnline') + '</span>' +
                    '</div>' +
                '</div>' +
                '<button id="victorClearBtn" class="victor-clear-btn" title="' + t('clearTitle') + '">' +
                    '<span>🗑️</span>' +
                    '<span>' + t('clearBtn') + '</span>' +
                '</button>' +
            '</div>' +
            '<div class="victor-chat-messages" id="victorChatMessages">' +
                buildWelcomeHTML() +
            '</div>' +
            '<div class="victor-chat-input-area">' +
                '<div class="victor-input-wrapper">' +
                    '<textarea id="victorUserInput" class="victor-user-input" placeholder="' + t('placeholder') + '" rows="1"></textarea>' +
                    '<button id="victorSendBtn" class="victor-send-btn">✈️</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    // Wait for DOM and insert
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.insertAdjacentHTML('beforeend', html);
            initVictorAI();
        });
    } else {
        document.body.insertAdjacentHTML('beforeend', html);
        initVictorAI();
    }

    // Initialize functionality
    function initVictorAI() {
        var isProcessing = false;

        // Storage config
        var STORAGE_KEY = 'victorAI_conversation';
        var STORAGE_EXPIRY_DAYS = 30;

        // Load conversation history from localStorage
        function loadConversationHistory() {
            try {
                var stored = localStorage.getItem(STORAGE_KEY);
                if (!stored) return [];

                var data = JSON.parse(stored);
                var now = new Date().getTime();

                if (data.timestamp && (now - data.timestamp) > (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)) {
                    console.log('[Victor AI] Conversation expired, clearing');
                    localStorage.removeItem(STORAGE_KEY);
                    return [];
                }

                console.log('[Victor AI] Loaded conversation:', data.history.length, 'messages');
                return data.history || [];
            } catch (e) {
                console.error('[Victor AI] Failed to load conversation:', e);
                return [];
            }
        }

        // Save conversation history
        function saveConversationHistory(history) {
            try {
                var data = {
                    history: history,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                console.log('[Victor AI] Conversation saved:', history.length, 'messages');
            } catch (e) {
                console.error('[Victor AI] Failed to save conversation:', e);
            }
        }

        // Utility functions
        function escapeHtml(text) {
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function scrollToBottom() {
            var messagesContainer = document.getElementById('victorChatMessages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Load conversation memory
        var conversationHistory = loadConversationHistory();

        // Restore conversation UI
        function restoreConversationUI() {
            if (conversationHistory.length === 0) return;

            var messagesContainer = document.getElementById('victorChatMessages');
            var welcome = messagesContainer.querySelector('.victor-welcome-message');
            if (welcome) welcome.remove();

            conversationHistory.forEach(function(item) {
                if (item.role === 'user') {
                    var messageDiv = document.createElement('div');
                    messageDiv.className = 'victor-message user';
                    messageDiv.innerHTML = '<div class="victor-message-avatar">👤</div>' +
                        '<div class="victor-message-bubble">' + escapeHtml(item.content) + '</div>';
                    messagesContainer.appendChild(messageDiv);
                } else {
                    var messageDiv = document.createElement('div');
                    messageDiv.className = 'victor-message assistant';
                    var renderedContent = item.content;
                    if (window.marked) {
                        renderedContent = marked.parse(item.content);
                    }
                    messageDiv.innerHTML = '<div class="victor-message-avatar">🔮</div>' +
                        '<div class="victor-message-bubble">' + renderedContent + '</div>';
                    messagesContainer.appendChild(messageDiv);
                }
            });

            scrollToBottom();
            console.log('[Victor AI] Restored', conversationHistory.length, 'messages');
        }

        restoreConversationUI();

        // Drag functionality
        var trigger = document.getElementById('victorChatTrigger');
        var POSITION_KEY = 'victorAI_buttonPosition';
        var isDragging = false;
        var startX, startY, startLeft, startBottom;
        var hasMoved = false;
        var fadeTimer = null;

        function startFadeTimer() {
            if (fadeTimer) clearTimeout(fadeTimer);
            trigger.classList.remove('faded');
            fadeTimer = setTimeout(function() {
                trigger.classList.add('faded');
            }, 3000);
        }

        function resetFade() {
            trigger.classList.remove('faded');
            startFadeTimer();
        }

        startFadeTimer();

        function loadButtonPosition() {
            try {
                var saved = localStorage.getItem(POSITION_KEY);
                if (saved) {
                    var pos = JSON.parse(saved);
                    trigger.style.bottom = pos.bottom + 'px';
                    trigger.style.right = pos.right + 'px';
                }
            } catch (e) {
                console.error('[Victor AI] Failed to load button position:', e);
            }
        }

        function saveButtonPosition(bottom, right) {
            try {
                localStorage.setItem(POSITION_KEY, JSON.stringify({bottom: bottom, right: right}));
            } catch (e) {
                console.error('[Victor AI] Failed to save button position:', e);
            }
        }

        loadButtonPosition();

        function onDragStart(e) {
            isDragging = true;
            hasMoved = false;
            trigger.classList.add('dragging');
            resetFade();

            var clientX = e.type.indexOf('touch') >= 0 ? e.touches[0].clientX : e.clientX;
            var clientY = e.type.indexOf('touch') >= 0 ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            var computedStyle = window.getComputedStyle(trigger);
            startLeft = parseInt(computedStyle.right);
            startBottom = parseInt(computedStyle.bottom);

            e.preventDefault();
        }

        function onDragMove(e) {
            if (!isDragging) return;

            var clientX = e.type.indexOf('touch') >= 0 ? e.touches[0].clientX : e.clientX;
            var clientY = e.type.indexOf('touch') >= 0 ? e.touches[0].clientY : e.clientY;

            var deltaX = clientX - startX;
            var deltaY = clientY - startY;

            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                hasMoved = true;
            }

            var newRight = Math.max(0, Math.min(window.innerWidth - trigger.offsetWidth, startLeft - deltaX));
            var newBottom = Math.max(0, Math.min(window.innerHeight - trigger.offsetHeight, startBottom - deltaY));

            trigger.style.right = newRight + 'px';
            trigger.style.bottom = newBottom + 'px';

            e.preventDefault();
        }

        function onDragEnd() {
            if (isDragging) {
                isDragging = false;
                trigger.classList.remove('dragging');

                if (!hasMoved) {
                    toggleChatWindow();
                } else {
                    var bottom = parseInt(trigger.style.bottom);
                    var right = parseInt(trigger.style.right);
                    saveButtonPosition(bottom, right);
                }

                hasMoved = false;
            }
        }

        function toggleChatWindow() {
            var chatWindow = document.getElementById('victorChatWindow');
            chatWindow.classList.toggle('active');
            trigger.classList.toggle('active');

            if (chatWindow.classList.contains('active')) {
                document.getElementById('victorUserInput').focus();
            }
        }

        trigger.addEventListener('mousedown', onDragStart);
        trigger.addEventListener('touchstart', onDragStart, {passive: false});
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('touchmove', onDragMove, {passive: false});
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd);

        // Send button
        document.getElementById('victorSendBtn').addEventListener('click', sendMessage);

        // Clear button
        document.getElementById('victorClearBtn').addEventListener('click', function() {
            conversationHistory = [];
            localStorage.removeItem(STORAGE_KEY);

            var messagesContainer = document.getElementById('victorChatMessages');
            messagesContainer.innerHTML = buildWelcomeHTML();

            console.log('[Victor AI] Conversation cleared');
        });

        // Input field
        var userInput = document.getElementById('victorUserInput');
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

        // Send message function
        async function sendMessage() {
            var input = document.getElementById('victorUserInput');
            var message = input.value.trim();

            if (!message || isProcessing) return;

            displayUserMessage(message);
            input.value = '';
            input.style.height = 'auto';

            isProcessing = true;
            updateSendButton(true);
            displayLoadingMessage();

            try {
                var contextPrompt = '';
                if (conversationHistory.length > 0) {
                    contextPrompt = 'Conversation history:\n';
                    conversationHistory.forEach(function(item) {
                        contextPrompt += (item.role === 'user' ? 'Client' : 'Assistant') + ': ' + item.content + '\n';
                    });
                    contextPrompt += '\n';
                }

                var prompt = CONFIG.promptTemplate(message);
                var fullPrompt = contextPrompt + prompt;

                console.log('[Victor AI] Sending to:', CONFIG.apiBackend + '/api/chat');
                console.log('[Victor AI] Model:', CONFIG.botName);
                console.log('[Victor AI] History count:', conversationHistory.length);

                var response = await fetch(CONFIG.apiBackend + '/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: CONFIG.botName,
                        message: fullPrompt
                    })
                });

                console.log('[Victor AI] Response status:', response.status);

                if (!response.ok) {
                    var errorText = await response.text();
                    console.error('[Victor AI] API error:', errorText);
                    throw new Error('API request failed (' + response.status + '): ' + errorText.substring(0, 100));
                }

                var data = await response.json();
                console.log('[Victor AI] Data received');
                removeLoadingMessage();

                var assistantResponse = '';
                if (data.response) {
                    assistantResponse = data.response;
                    displayAssistantMessage(data.response);
                } else if (data.text) {
                    assistantResponse = data.text;
                    displayAssistantMessage(data.text);
                } else {
                    console.error('[Victor AI] Invalid response format');
                    throw new Error('Invalid response format. API returned: ' + JSON.stringify(data).substring(0, 100));
                }

                conversationHistory.push({ role: 'user', content: message });
                conversationHistory.push({ role: 'assistant', content: assistantResponse });

                saveConversationHistory(conversationHistory);
            } catch (error) {
                console.error('[Victor AI] Error:', error);
                removeLoadingMessage();

                var errorMessage = t('errorGeneric');
                if (error.message.indexOf('Failed to fetch') >= 0) {
                    errorMessage = t('errorNetwork');
                } else {
                    errorMessage = error.message;
                }

                displayError(errorMessage + t('errorContact'));
            } finally {
                isProcessing = false;
                updateSendButton(false);
            }
        }

        function displayUserMessage(text) {
            var messagesContainer = document.getElementById('victorChatMessages');
            var welcome = messagesContainer.querySelector('.victor-welcome-message');
            if (welcome) welcome.remove();

            var messageDiv = document.createElement('div');
            messageDiv.className = 'victor-message user';
            messageDiv.innerHTML = '<div class="victor-message-avatar">👤</div>' +
                '<div class="victor-message-bubble">' + escapeHtml(text) + '</div>';

            messagesContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        function displayLoadingMessage() {
            var messagesContainer = document.getElementById('victorChatMessages');
            var loadingDiv = document.createElement('div');
            loadingDiv.className = 'victor-message assistant';
            loadingDiv.id = 'victorLoadingMessage';
            loadingDiv.innerHTML = '<div class="victor-message-avatar">🔮</div>' +
                '<div class="victor-message-bubble">' +
                    '<div class="victor-typing-indicator">' +
                        '<div class="victor-typing-dot"></div>' +
                        '<div class="victor-typing-dot"></div>' +
                        '<div class="victor-typing-dot"></div>' +
                    '</div>' +
                '</div>';

            messagesContainer.appendChild(loadingDiv);
            scrollToBottom();
        }

        function removeLoadingMessage() {
            var loading = document.getElementById('victorLoadingMessage');
            if (loading) loading.remove();
        }

        function displayAssistantMessage(content) {
            var messagesContainer = document.getElementById('victorChatMessages');
            var messageDiv = document.createElement('div');
            messageDiv.className = 'victor-message assistant';

            var renderedContent = content;
            if (window.marked) {
                renderedContent = marked.parse(content);
            }

            messageDiv.innerHTML = '<div class="victor-message-avatar">🔮</div>' +
                '<div class="victor-message-bubble">' + renderedContent + '</div>';

            messagesContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        function displayError(errorText) {
            var messagesContainer = document.getElementById('victorChatMessages');
            var errorDiv = document.createElement('div');
            errorDiv.className = 'victor-message assistant';
            errorDiv.innerHTML = '<div class="victor-message-avatar">⚠️</div>' +
                '<div class="victor-message-bubble">' +
                    '<div class="victor-error-message">' + escapeHtml(errorText) + '</div>' +
                '</div>';

            messagesContainer.appendChild(errorDiv);
            scrollToBottom();
        }

        function updateSendButton(processing) {
            var btn = document.getElementById('victorSendBtn');
            btn.disabled = processing;
            btn.textContent = processing ? '⏳' : '✈️';
        }

        // Global function for quick questions
        window.VictorAI = {
            askQuestion: function(question) {
                document.getElementById('victorUserInput').value = question;
                sendMessage();
            }
        };
    }
})();
