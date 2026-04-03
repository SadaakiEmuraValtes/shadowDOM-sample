'use strict';

/**
 * <lib-book-widget>
 * book-widget.html（iframe）内で使う Shadow DOM コンポーネント。
 * URL クエリ ?id=N から書籍IDを取得し、以下を表示する:
 *   - 書籍紹介文
 *   - 発行情報テーブル（初版発行年・出版社・ページ数・所蔵冊数）
 *
 * このコンポーネントは iframe の中に配置され、
 * 親ページ（book-detail.html）の Shadow DOM と組み合わせることで
 * 「Shadow DOM → iframe → Shadow DOM」の二重構造を構成する。
 */

/* -------------------------------------------------------
 *  書籍メタデータ（紹介文・発行情報）
 *  ※ lib-book-detail.js と同じデータ。iframe は独立したページなので複製が必要。
 * ----------------------------------------------------- */
const WIDGET_BOOK_META = {
  1:  { year: 1905, publisher: '岩波文庫', pages: 638, description: '主人公の猫の視点から、明治時代の知識人社会をユーモアたっぷりに風刺した長編小説。「吾輩は猫である。名前はまだない。」という書き出しは日本文学史上最も有名な一文のひとつ。' },
  2:  { year: 1906, publisher: '岩波文庫', pages: 258, description: '四国の中学校に赴任した快活な主人公が、曲者揃いの同僚たちと奮闘する痛快な青春小説。漱石の代表作のひとつで、正義感と人情の葛藤が生き生きと描かれている。' },
  3:  { year: 1914, publisher: '岩波文庫', pages: 372, description: '明治の末期、先生と学生の間に生まれた深い友情と、その裏に隠された秘密を描いた心理小説。「自分」「先生」「K」の三者の関係を通じてエゴイズムと孤独を掘り下げる。' },
  4:  { year: 1908, publisher: '新潮文庫', pages: 318, description: '東京帝国大学に進学した地方出身の青年・三四郎の成長物語。「迷羊（ストレイシープ）」という言葉が印象的な、明治後期の東京の空気感を伝える青春小説。' },
  5:  { year: 1909, publisher: '新潮文庫', pages: 284, description: '「こころ」の前作にあたる「前期三部作」の第二作。三四郎の後輩・代助を主人公に、愛と義理のあいだで揺れる知識人の苦悩を描く。' },
  6:  { year: 1910, publisher: '岩波文庫', pages: 248, description: '前期三部作の完結編。宗助と御米の夫婦の静かな日常を描きながら、過去の罪と向き合う男の苦しみを淡々と綴る。禅寺の場面が印象的。' },
  7:  { year: 1906, publisher: '岩波文庫', pages: 224, description: '画家が理想の境地を求めて山里を旅する「非人情」の世界を描いた小説。「智に働けば角が立つ」という冒頭が有名で、漱石の美学論とも読める異色作。' },
  8:  { year: 1915, publisher: '新潮文庫', pages: 184, description: '平安末期の羅生門を舞台に、下人と老婆の対峙を通じて人間の利己心と倫理の崩壊を描く短編の傑作。高校現代文の定番教材として広く知られている。' },
  9:  { year: 1922, publisher: '新潮文庫', pages: 168, description: '山中の殺人事件を七人の証言から再構成する短編。誰の証言が真実かわからない「藪の中」という状況は「真実の不可知性」の比喩として現代語にもなった。' },
  10: { year: 1922, publisher: '岩波文庫', pages: 156, description: '少年がトロッコに乗って遠くへ行き、帰り道をひとりで歩いて帰る短い物語。子供の心理と孤独を繊細に描いた芥川の代表的な児童向け短編のひとつ。' },
  11: { year: 1916, publisher: '岩波文庫', pages: 148, description: '池の禅寺に住む僧・内供の長い鼻をめぐる滑稽で哀れな物語。人間の見栄と自尊心を鋭く突いた初期の傑作短編で、夏目漱石に高く評価された。' },
  12: { year: 1918, publisher: '新潮文庫', pages: 172, description: '絵師・良秀が娘を犠牲にして「地獄変」の屏風を完成させる物語。芸術への狂気的な執念と人間の業を描いた芥川文学の頂点のひとつ。' },
  13: { year: 1948, publisher: '新潮文庫', pages: 191, description: '「恥の多い生涯を送って来ました」で始まる自伝的な小説。人間社会に馴染めない主人公の葛藤と自己崩壊を描き、戦後日本で多くの読者の共感を得た太宰の代表作。' },
  14: { year: 1940, publisher: '角川文庫', pages: 96,  description: 'メロスが親友セリヌンティウスとの約束を果たすために疾走する友情と信頼の物語。中学国語の教科書に収録されており、最もよく知られた短編のひとつ。' },
  15: { year: 1947, publisher: '新潮文庫', pages: 168, description: '没落していく旧華族の母と子を描いた戦後小説。「斜陽族」という言葉を生んだほど話題になり、太宰の円熟期の代表作として評価が高い。' },
  16: { year: 1944, publisher: '岩波文庫', pages: 234, description: '太宰治が故郷・津軽を旅した記録文学。素朴な人々との出会いや幼少期の記憶を辿りながら、作家の原点に迫る私小説的な紀行文。' },
  17: { year: 1947, publisher: '新潮文庫', pages: 124, description: '夫が戦争で行方不明になった妻・佐智の奮闘と愛の物語。タイトルはヴィヨンの詩「遺言詩」にちなむ。晩年の太宰が書いた洗練された短編集のひとつ。' },
  18: { year: 1934, publisher: '角川文庫', pages: 152, description: 'ジョバンニとカムパネルラが銀河鉄道に乗って宇宙を旅する幻想的な物語。賢治の死後に発見された未完の遺作で、生死・孤独・幸福の意味を深く問いかける童話の傑作。' },
  19: { year: 1934, publisher: '岩波文庫', pages: 128, description: '風の又三郎という不思議な少年が農村の子供たちと交わる夏の物語。自然の力と子供の世界を幻想的に描いた賢治の代表的な童話。' },
  20: { year: 1934, publisher: '岩波文庫', pages: 112, description: '下手なチェロ弾きのゴーシュが動物たちとの夜の交流を通じて腕を上げていく物語。音楽と自然の融合をファンタジックに描いた賢治晩年の傑作。' },
  21: { year: 1924, publisher: '新潮文庫', pages: 96,  description: '紳士たちが「注文の多い料理店」に入ると、次々と奇妙な注文が現れる不条理な恐怖譚。賢治の代表的な短編集の表題作で、ブラックユーモアが光る。' },
  22: { year: 1937, publisher: '新潮文庫', pages: 196, description: '「国境の長いトンネルを抜けると雪国であった」という冒頭で有名。温泉地で出会った芸者・駒子と東京の男・島村の哀しい恋愛を雪の白さとともに描く。ノーベル文学賞受賞作。' },
  23: { year: 1926, publisher: '新潮文庫', pages: 104, description: '伊豆を旅する一高生と旅芸人一座の少女・薫との淡い交流を描く抒情的な小説。川端文学の原点とも言われる青春の美しさと哀愁。' },
  24: { year: 1962, publisher: '新潮文庫', pages: 288, description: '京都を舞台に、生き別れの双子の姉妹の数奇な運命を美しい日本の四季とともに描く。川端の円熟期の傑作で、日本の伝統美への深い愛着が随所に感じられる。' },
  25: { year: 1952, publisher: '新潮文庫', pages: 168, description: '鎌倉の茶道の世界を背景に、若い男女の交錯する愛と嫉妬を描いた美的な恋愛小説。茶道具「千羽鶴」のイメージが物語全体を彩る。' },
  26: { year: 1956, publisher: '新潮文庫', pages: 292, description: '京都・金閣寺を焼いた実際の事件をもとに、美への執着から放火に至る若い僧の内面を描いた長編。三島文学の最高傑作と呼ばれる作品。' },
  27: { year: 1949, publisher: '新潮文庫', pages: 248, description: '三島の処女長編的な自伝小説。主人公が自分の内面と向き合いながら成長する過程を、美しい文体で描く。戦後文学の代表作のひとつ。' },
  28: { year: 1954, publisher: '新潮文庫', pages: 212, description: '海辺の漁村を舞台にした純愛物語。貧しくも誠実な漁師の息子と灯台長の娘の愛を清潔な文体で描き、三島の作品では珍しく明るい結末を持つ。' },
  29: { year: 1987, publisher: '講談社文庫', pages: 520, description: 'ビートルズの曲名を冠した長編恋愛小説。喪失と記憶、生と死を背景に、二人の女性と主人公の青春を描く。日本で発売直後に大ベストセラーとなった。' },
  30: { year: 2009, publisher: '新潮文庫', pages: 1352, description: '1984年の東京を舞台にした複雑なパラレルワールド小説。「1Q84」というもうひとつの世界を行き来する男女の物語。全3冊の大作。' },
  31: { year: 2002, publisher: '新潮文庫', pages: 724, description: '15歳の少年カフカが家出し、四国の図書館に辿り着く物語と、老人ナカタの奇妙な旅が交互に進む長編。夢と現実が交錯する村上春樹の代表作のひとつ。' },
  32: { year: 1994, publisher: '新潮文庫', pages: 1268, description: '探偵・岡田亨がある日突然妻に失踪された謎を追う物語。「ねじまき鳥」という謎めいた存在と昭和の歴史的暴力が交錯する全3冊の大長編。' },
  33: { year: 1982, publisher: '講談社文庫', pages: 296, description: '羊の印を持つ男を探す旅に出る主人公の物語。デビュー3作目にして初めてのハードボイルド的な長編。後の村上作品の世界観の原型がここにある。' },
  34: { year: 1999, publisher: '講談社文庫', pages: 234, description: 'スミレとミュウという二人の女性の不思議な関係を描いた中編小説。恋愛・消失・音楽というテーマが村上らしい文体で綴られる。' },
  35: { year: 1958, publisher: '新潮文庫', pages: 226, description: '時刻表を使ったアリバイ崩しが見どころの社会派推理小説。占領期の政財界の腐敗を背景に、週刊誌記者が殺人事件の謎に迫る。松本清張の代表作。' },
  36: { year: 1961, publisher: '新潮文庫', pages: 712, description: '戦後の大阪を舞台にした長編ミステリー。陶芸家の父を持つ男が過去の秘密を持つ女に引かれていく。社会的テーマと細密なトリックが高く評価される大作。' },
  37: { year: 1958, publisher: '光文社文庫', pages: 272, description: '北陸の雪深い旅館で見つかった死体をめぐるアリバイ崩しの傑作。緻密なトリック構成と、戦後日本の暗い側面を描いた社会派推理の傑作。' },
  38: { year: 1958, publisher: '新潮文庫', pages: 312, description: '複数の独立した短編から成る連作集。各話に「黒い」キーワードが付き、現代社会の暗部を鋭く描いた松本清張の初期傑作短編群。' },
  39: { year: 2005, publisher: '文春文庫', pages: 376, description: '天才数学者・石神が元教え子の花岡靖子のために完全犯罪を計画する。「献身」の意味を最後に逆転させる構成が絶賛された直木賞受賞作。ガリレオシリーズ。' },
  40: { year: 2002, publisher: '集英社文庫', pages: 888, description: '少年時代に運命的に出会った桐原亮司と西本雪穂の19年間を追う大長編。光の届かない「白夜」のような二人の関係が衝撃の結末へ向かう。' },
  41: { year: 2004, publisher: '集英社文庫', pages: 568, description: '「白夜行」の姉妹編的な位置づけを持つ長編。美しい女性・雅也を中心とした謎と陰謀が交錯する。東野作品の中でも特にダークな雰囲気を持つ一作。' },
  42: { year: 2012, publisher: '角川文庫', pages: 400, description: '廃業した雑貨店の三十二年分の手紙を読んでいく主人公の感動的な物語。各章で悩める人々と亡き店主との往来が描かれる。東野作品の中でも異色の感動作。' },
  43: { year: 1998, publisher: '文春文庫', pages: 312, description: '交通事故で亡くなった妻が、別の女性の身体に宿って夫の前に現れる。愛と秘密を巡るサスペンスで、東野圭吾が純粋な感動を追求した人気作。' },
  44: { year: 2003, publisher: '東京創元社', pages: 324, description: '仙台を舞台に、コインロッカーで発見された赤ちゃんの秘密を巡る謎と友情の物語。二つの時系列が最後に交差する鮮やかな構成が光る。' },
  45: { year: 2007, publisher: '新潮文庫', pages: 476, description: '首相の暗殺計画に巻き込まれた男が、仙台の街を逃げ続ける一日を描くリーマン・エスケープ小説。伏線の回収と映画的なテンポが絶賛された直木賞受賞作。' },
  46: { year: 2000, publisher: '東京創元社', pages: 348, description: '孤島に住む「人の心を読める」かかし・オサムが殺される謎を解くデビュー長編。奇想天外な設定と哲学的なテーマが共存する伊坂ワールドの原点。' },
  47: { year: 2003, publisher: '東京創元社', pages: 296, description: '遺伝子研究者の父を持つ二人兄弟の物語。「世界を変えるための重力」という主題のもと、出生の秘密と兄弟の絆を描くサスペンス。' },
  48: { year: 1992, publisher: '新潮文庫', pages: 588, description: '多重債務に苦しむ女性が突然失踪した謎を追う社会派ミステリー。消費者金融の闇と追い詰められた人間の心理を丁寧に描いた宮部の代表作のひとつ。' },
  49: { year: 2001, publisher: '新潮文庫', pages: 1528, description: '連続幼女誘拐殺人事件を多角的な視点から描く大長編ミステリー。マスメディアの報道姿勢や犯罪者の心理まで深く掘り下げた宮部みゆきの最高傑作との呼び声も高い。' },
  50: { year: 2012, publisher: '新潮文庫', pages: 2040, description: '中学校で起きた殺人事件を生徒・教師・保護者たちが自ら裁く試みを描く超大作。司法制度・青年心理・メディアへの深い洞察を込めた野心的な長編。' },
  51: { year: 1890, publisher: '岩波文庫', pages: 84,  description: '明治時代の留学生・太田豊太郎とドイツ人女性エリスの悲恋を描いた短編。文語文体の美しさと主人公の葛藤が読者を引き込む鴎外の代表的な初期作品。' },
  52: { year: 1915, publisher: '岩波文庫', pages: 128, description: '人身売買や流刑という社会的悲劇の中に、人間の尊厳と愛の崇高さを描いた歴史小説。武家社会の理不尽を問いかける中編の傑作。' },
  53: { year: 1913, publisher: '岩波文庫', pages: 148, description: '江戸時代の細川家で起きた殉死事件をもとに、藩士たちの義理と生死を描いた歴史小説。武士道の残酷な側面を冷静な筆致で描く。' },
  54: { year: 1948, publisher: '新潮文庫', pages: 824, description: '昭和初期の大阪を舞台に、没落しかけた旧家の四姉妹の生活と恋愛を描いた大長編。関西文化の美しさと人情味が横溢する、谷崎の代表作。' },
  55: { year: 1925, publisher: '新潮文庫', pages: 268, description: '「私」という男が西洋風の少女・ナオミに魅せられ翻弄されていく様子を描く。「ナオミズム」という言葉を生んだ近代文学の問題作。' },
  56: { year: 1933, publisher: '岩波文庫', pages: 144, description: '日本家屋における陰影の美しさを論じたエッセイ。薄暗い空間に宿る美学を説き、現代のインテリアデザインや建築思想にも影響を与え続ける名著。' },
  57: { year: 1937, publisher: '岩波文庫', pages: 512, description: '「小説の神様」と呼ばれた志賀直哉の唯一の長編小説。主人公・時任謙作の前半生と、父との確執・恋愛・人生の模索を描く自伝的大作。' },
  58: { year: 1917, publisher: '岩波文庫', pages: 128, description: '兵庫県の城崎温泉に滞在した著者が生と死について静かに考察する短編。ほかの動物の死を見つめながら「自分もいつか死ぬ」と向き合う、日本近代文学の名篇。' },
  59: { year: 2016, publisher: '文春文庫', pages: 184, description: '36歳になってもコンビニでアルバイトを続ける古倉恵子の物語。「普通」とは何かを問いかけ、多様な生き方を肯定する芥川賞受賞作。' },
  60: { year: 2015, publisher: '河出書房新社', pages: 272, description: '生殖と愛が切り離された近未来日本を描くSF的な実験小説。村田沙耶香が問う「普通の家族像」への根源的な問いが衝撃を与えた話題作。' },
  61: { year: 2016, publisher: '幻冬舎文庫', pages: 504, description: '国際ピアノコンクールを舞台に、四人の若き天才ピアニストたちの戦いを描く。音楽の躍動感と登場人物の心理が絡み合う直木賞・本屋大賞受賞の大作。' },
  62: { year: 2004, publisher: '新潮文庫', pages: 280, description: '高校で恒例の80キロ夜間歩行行事「夜のピクニック」に臨む生徒たちの一夜を描く青春小説。淡い恋愛と友情、秘密の告白が詰まった本屋大賞受賞作。' },
  63: { year: 2020, publisher: '東京創元社', pages: 348, description: '居場所を失った女・更紗が15年後に再会した文と逃避行する物語。愛と孤独、世間の目線を問いかける本屋大賞受賞作。' },
  64: { year: 2022, publisher: '講談社', pages: 360, description: '瀬戸内の島で生きる高校生・暁海と北原くんの純愛と別れを描く。「愛される人生」と「愛する人生」のどちらを選ぶかという問いが心に刺さる本屋大賞受賞作。' },
  65: { year: 2020, publisher: '中央公論新社', pages: 312, description: '52ヘルツという誰にも聞こえない孤独な鯨の声に例えられた人々のつながりを描く。傷つき孤立した人々が互いを救い合う感動の本屋大賞受賞作。' },
  66: { year: 2022, publisher: '朝日新聞出版', pages: 224, description: '小さな食品会社を舞台に繰り広げられる人間関係の微妙なすれ違いを描く。「食べる」ことを巡る日常の違和感を鋭く切り取った芥川賞受賞作。' },
  67: { year: 1957, publisher: '早川書房', pages: 296, description: '猫のピートが未来から過去へタイムトラベルする冒険を描くハインラインの名作SF。タイムトラベルものの古典として多くの読者に愛されている。' },
  68: { year: 1953, publisher: '早川書房', pages: 264, description: '宇宙人「オーバーロード」が突然現れ地球を平和裏に支配する近未来を描いた哲学的SF。人類の幼年期の終わりとは何かを問いかけるSFの傑作。' },
  69: { year: 1979, publisher: '河出書房新社', pages: 232, description: '宇宙が突然消滅する危機に際し、ヒッチハイカーのアーサーが銀河を旅する大コメディSF。ブリティッシュユーモアと哲学が融合した唯一無二の作品。' },
  70: { year: 1966, publisher: '早川書房', pages: 340, description: '知的障害を持つチャーリーが手術によって天才になり、やがて元に戻っていく過程を日記形式で描く。IQと幸福、社会と個人の関係を問う永遠のSF名作。' },
  71: { year: 2008, publisher: '早川書房', pages: 344, description: '人の「意識」そのものを書き換える医療行為が普及した近未来を描く日本SF。伊藤計劃の鮮烈なデビュー作にして最高傑作。ハーモニーとは何かを問いかける。' },
  72: { year: 2007, publisher: '早川書房', pages: 368, description: '2020年代、人間の選好を操作する「感染」が世界を席巻する近未来を描く。虐殺を可能にする言語器官の謎を追う軍事スリラーSF。伊藤計劃の出世作。' },
  73: { year: 2019, publisher: '早川書房', pages: 480, description: '宇宙人との接触を巡る中国のSF大作。科学・思想・歴史が交錯する壮大なスケールで、中国のSFブームを世界に知らしめたヒューゴー賞受賞作。' },
  74: { year: 2015, publisher: '早川書房', pages: 196, description: '近未来の北京が折りたたまれて3つの階層世界に分かれ、そこで暮らす人々の格差と生を描く短編。ヒューゴー賞中短編部門受賞作。' },
  75: { year: 1951, publisher: '白水社', pages: 312, description: '学校を追い出された少年ホールデンがニューヨークを放浪する3日間を描く青春小説。反抗と孤独、大人社会への嫌悪を生き生きと描いた永遠の青春文学。' },
  76: { year: 1952, publisher: '新潮文庫', pages: 156, description: 'キューバの老漁師サンチャゴが巨大カジキと格闘する3日間を描く短編。人間の尊厳と自然との戦いを簡潔な文体で描いたノーベル文学賞受賞の代表作。' },
  77: { year: 1929, publisher: '新潮文庫', pages: 368, description: '第一次世界大戦のイタリア戦線を舞台にした反戦恋愛小説。負傷した軍人フレデリックと看護婦キャサリンの悲恋を詩的な文体で綴るヘミングウェイの大作。' },
  78: { year: 1925, publisher: '新潮文庫', pages: 216, description: '1920年代ニューヨークの大富豪ギャツビーとデイジーへの叶わぬ愛を描く短編。「アメリカンドリーム」の幻想と崩壊を描いた20世紀文学の傑作。' },
  79: { year: 1949, publisher: '早川書房', pages: 372, description: '全体主義国家が支配する近未来「オセアニア」を舞台に、真実省に勤める男ウィンストンの抵抗と絶望を描く。「ビッグブラザー」という言葉を生んだ不朽のディストピア小説。' },
  80: { year: 1945, publisher: '角川文庫', pages: 128, description: '農場を支配した豚たちが次第に人間と同じになっていく寓話。ソビエト体制への批判を込めた政治的風刺小説で、「すべての動物は平等だ」が有名。' },
  81: { year: 1915, publisher: '新潮文庫', pages: 128, description: 'ある朝目覚めたグレゴールが巨大な虫に変身していた、という冒頭が衝撃的な不条理小説。家族関係と社会的疎外を寓意的に描くカフカの代表作。' },
  82: { year: 1926, publisher: '新潮文庫', pages: 312, description: '城に呼ばれながら永遠に辿り着けない測量士Kを描く未完の長編。官僚制の不条理と神への問いを表現した「カフカ的状況」の原典。' },
  83: { year: 1866, publisher: '新潮文庫', pages: 728, description: '元学生ラスコーリニコフが金貸しの老婆を殺し、良心の呵責と追跡の恐怖の中で自首に至るまでを描く心理小説の金字塔。' },
  84: { year: 1880, publisher: '新潮文庫', pages: 1440, description: 'カラマーゾフ家の三兄弟を通じて神と悪、自由と責任という人類の根本問題を描く大長編。「大審問官」のくだりは特に有名なドストエフスキーの集大成。' },
  85: { year: 1869, publisher: '新潮文庫', pages: 1920, description: 'ナポレオンのロシア遠征を背景に、公爵家の若者たちの愛と戦争を描くトルストイの最高傑作。歴史と人間の意志についての深い洞察を含む世界文学の金字塔。' },
  86: { year: 1878, publisher: '新潮文庫', pages: 1120, description: '不倫の恋に落ちたアンナと鉄道事故の結末を描く悲劇的恋愛小説。トルストイの道徳観と社会批判を含む19世紀ロシア文学の傑作。' },
  87: { year: 1967, publisher: '新潮社', pages: 576, description: 'マコンドという架空の町の開拓者ブエンディア家の百年間を幻想と現実が溶け合う文体で描く魔術的リアリズムの代表作。ノーベル文学賞受賞。' },
  88: { year: 1942, publisher: '新潮文庫', pages: 192, description: '「きょう、ママンが死んだ」という書き出しで知られる不条理小説の傑作。太陽の光の下で殺人を犯した男ムルソーの裁判と処刑を描く実存主義文学の入門書。' },
  89: { year: 1947, publisher: '新潮文庫', pages: 384, description: 'アルジェリアのオラン市を襲うペストをめぐる人間群像劇。疫病という非常事態が暴く人間の連帯と孤独を描き、カミュの最も読まれる作品となっている。' },
  90: { year: 2016, publisher: 'KADOKAWA', pages: 264, description: '映画「君の名は。」の原作小説。山奥の女の子・三葉と東京の男の子・瀧が体を入れ替わる不思議な体験の中で引かれ合う、新海誠監督自ら書き下ろしたノベライズ。' },
  91: { year: 2003, publisher: '角川スニーカー文庫', pages: 288, description: '超能力を持つ謎の少女・涼宮ハルヒと彼女に翻弄される高校生・キョンの日常非日常を描くラノベシリーズの第1作。サブカルチャーに多大な影響を与えた。' },
  92: { year: 2009, publisher: 'アスキー・メディアワークス', pages: 268, description: '近未来に実現した仮想現実ゲーム「SAO」に閉じ込められたプレイヤーたちの脱出を描くラノベシリーズの第1作。アニメ化で世界的人気を獲得した。' },
  93: { year: 2013, publisher: 'KADOKAWA', pages: 292, description: '下剋上を目指す引きこもり少年・和也が異世界転移する異世界コメディの第1巻。「この素晴らしい世界に祝福を！」通称「このすば」の人気シリーズ。' },
  94: { year: 1924, publisher: '岩波文庫', pages: 148, description: '「春と修羅」「永訣の朝」など、賢治が生前に刊行した唯一の詩集。農民的生活と宇宙的なロマンが交錯する独特のイーハトーブ世界が詩に結実している。' },
  95: { year: 1910, publisher: '岩波文庫', pages: 128, description: '石川啄木の第一歌集。三行書きという独自の形式で貧困・失望・望郷を歌い、近代短歌に新風を吹き込んだ。「働けど働けど猶わが生活楽にならざり」が有名。' },
  96: { year: 1941, publisher: '新潮文庫', pages: 112, description: '妻・智恵子への愛と、脳病院に入院する彼女を見舞い続けた詩人の記録。「レモン哀歌」などの詩に込められた純粋な愛と深い哀しみが読む者の心を打つ。' },
  97: { year: 1977, publisher: '花神社', pages: 144, description: '戦後日本を代表する女性詩人・茨木のり子の詩集。表題作「わたしが一番きれいだったとき」は戦争を生きた女性の悲しみと怒りを叙情的に歌い上げた名詩。' },
  98: { year: 1966, publisher: '文春文庫', pages: 2392, description: '幕末維新の英雄・坂本龍馬の生涯を描く司馬遼太郎の代表作。全8巻の大長編で、自由奔放で先見性を持つ龍馬像を確立し、歴史小説の金字塔となった。' },
  99: { year: 1972, publisher: '文春文庫', pages: 3000, description: '明治の日露戦争時代を生きた秋山兄弟と正岡子規の生涯を描く大長編。近代日本人の気骨と楽観主義を描き出す司馬遼太郎の最高傑作のひとつ。全8巻。' },
 100: { year: 1939, publisher: '講談社文庫', pages: 2880, description: '宮本武蔵の生涯を描く吉川英治の歴史小説。剣豪として知られる武蔵の成長と悟道を、佐々木小次郎との宿命の対決に向けて描く大衆歴史小説の金字塔。' },
};

function getWidgetMeta(bookId) {
  return WIDGET_BOOK_META[bookId] || {
    year: 2000, publisher: '市立図書館蔵書', pages: 256,
    description: 'この書籍の詳細な紹介文は準備中です。',
  };
}

/* -------------------------------------------------------
 *  コンポーネント
 * ----------------------------------------------------- */
class LibBookWidget extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._bookId = parseInt(new URLSearchParams(location.search).get('id'));
    this._render();
  }

  _render() {
    const book = Store.getBooks().find(b => b.id === this._bookId);

    if (!book) {
      this._shadow.innerHTML = `<p style="color:#94a3b8;padding:16px;">書籍情報が見つかりません</p>`;
      // 高さを親へ通知
      this._notifyHeight();
      return;
    }

    const meta      = getWidgetMeta(book.id);
    const available = Store.availableStock(book.id);

    this._shadow.innerHTML = `
      <style>
        * { box-sizing: border-box; }
        :host { display: block; font-family: 'Segoe UI', 'Helvetica Neue', sans-serif; }

        .widget-label {
          font-size: .7rem; font-weight: 700; letter-spacing: .08em;
          color: #94a3b8; text-transform: uppercase; margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px;
        }
        .widget-label::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }
        .iframe-badge {
          font-size: .68rem; font-weight: 700;
          background: #fef3c7; color: #92400e;
          padding: 2px 8px; border-radius: 10px; margin-left: 4px;
        }

        /* 書籍紹介 */
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: .92rem; font-weight: 700; color: #1a3a5c;
          margin-bottom: 10px; padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
          display: flex; align-items: center; gap: 6px;
        }
        .description {
          font-size: .9rem; color: #374151; line-height: 1.8;
        }

        /* 発行情報テーブル */
        .pub-table { width: 100%; border-collapse: collapse; font-size: .88rem; }
        .pub-table th, .pub-table td {
          padding: 7px 10px; border-bottom: 1px solid #f1f5f9; text-align: left;
        }
        .pub-table th { width: 110px; color: #64748b; font-weight: 600; }
        .pub-table td { color: #1e293b; }
      </style>

      <div class="widget-label">
        書籍情報ウィジェット
        <span class="iframe-badge">iframe + Shadow DOM</span>
      </div>

      <!-- 書籍紹介 -->
      <div class="section">
        <div class="section-title">📖 書籍紹介</div>
        <div class="description" data-testid="widget-description">${meta.description}</div>
      </div>

      <!-- 発行情報 -->
      <div class="section">
        <div class="section-title">📋 発行情報</div>
        <table class="pub-table" data-testid="widget-pub-table">
          <tr><th>書名</th><td data-testid="widget-pub-title">${book.title}</td></tr>
          <tr><th>著者</th><td data-testid="widget-pub-author">${book.author}</td></tr>
          <tr><th>ジャンル</th><td data-testid="widget-pub-genre">${book.genre}</td></tr>
          <tr><th>初版発行年</th><td data-testid="widget-pub-year">${meta.year} 年</td></tr>
          <tr><th>出版社</th><td data-testid="widget-pub-publisher">${meta.publisher}</td></tr>
          <tr><th>ページ数</th><td data-testid="widget-pub-pages">${meta.pages} ページ</td></tr>
          <tr><th>所蔵冊数</th><td data-testid="widget-pub-stock">${book.stock} 冊（貸出可: ${available} 冊）</td></tr>
        </table>
      </div>
    `;

    this._notifyHeight();
  }

  /** iframe の高さを親ウィンドウへ postMessage で通知 */
  _notifyHeight() {
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'widget-height', height: h }, '*');
    });
  }
}

customElements.define('lib-book-widget', LibBookWidget);
