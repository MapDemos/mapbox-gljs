// Static categories list (fetched from Mapbox API with the provided token)
// This list contains 285 categories for Japan
const STATIC_CATEGORIES = [
  {"canonical_id": "生活", "icon": "shop", "name": "生活"},
  {"canonical_id": "レストラン", "icon": "restaurant", "name": "レストラン"},
  {"canonical_id": "ショップ", "icon": "shop", "name": "ショップ"},
  {"canonical_id": "レストラン>その他", "icon": "restaurant", "name": "レストラン>その他"},
  {"canonical_id": "トラベル", "icon": "suitcase", "name": "トラベル"},
  {"canonical_id": "医療", "icon": "hospital", "name": "医療"},
  {"canonical_id": "レストラン>和食", "icon": "restaurant", "name": "レストラン>和食"},
  {"canonical_id": "生活>美容院", "icon": "hairdresser", "name": "生活>美容院"},
  {"canonical_id": "レストラン>バー", "icon": "bar", "name": "レストラン>バー"},
  {"canonical_id": "レジャー", "icon": "amusement-park", "name": "レジャー"},
  {"canonical_id": "ショップ>スーパー", "icon": "shop", "name": "ショップ>スーパー"},
  {"canonical_id": "生活>不動産", "icon": "home", "name": "生活>不動産"},
  {"canonical_id": "生活>老人施設", "icon": "shop", "name": "生活>老人施設"},
  {"canonical_id": "レストラン>カフェ", "icon": "cafe", "name": "レストラン>カフェ"},
  {"canonical_id": "生活>福祉施設", "icon": "shop", "name": "生活>福祉施設"},
  {"canonical_id": "医療>病院", "icon": "hospital", "name": "医療>病院"},
  {"canonical_id": "生活>国の機関", "icon": "town-hall", "name": "生活>国の機関"},
  {"canonical_id": "トラベル>観光名所", "icon": "attraction", "name": "トラベル>観光名所"},
  {"canonical_id": "生活>宗教(その他)", "icon": "shop", "name": "生活>宗教(その他)"},
  {"canonical_id": "レストラン>ファストフード", "icon": "fast-food", "name": "レストラン>ファストフード"},
  {"canonical_id": "生活>学校(その他)", "icon": "school", "name": "生活>学校(その他)"},
  {"canonical_id": "トラベル>駐車場", "icon": "parking", "name": "トラベル>駐車場"},
  {"canonical_id": "ショップ>コンビニ", "icon": "convenience", "name": "ショップ>コンビニ"},
  {"canonical_id": "レジャー>公園", "icon": "park", "name": "レジャー>公園"},
  {"canonical_id": "トラベル>バス", "icon": "bus", "name": "トラベル>バス"},
  {"canonical_id": "生活>自動車修理", "icon": "car-repair", "name": "生活>自動車修理"},
  {"canonical_id": "ショップ>薬局", "icon": "pharmacy", "name": "ショップ>薬局"},
  {"canonical_id": "医療>薬局", "icon": "pharmacy", "name": "医療>薬局"},
  {"canonical_id": "トラベル>ホテル", "icon": "lodging", "name": "トラベル>ホテル"},
  {"canonical_id": "ショップ>新車販売", "icon": "car", "name": "ショップ>新車販売"},
  {"canonical_id": "生活>ハウスクリーニング", "icon": "shop", "name": "生活>ハウスクリーニング"},
  {"canonical_id": "生活>学習塾", "icon": "school", "name": "生活>学習塾"},
  {"canonical_id": "生活>寺院", "icon": "religious-buddhist", "name": "生活>寺院"},
  {"canonical_id": "トラベル>ガソリンスタンド", "icon": "fuel", "name": "トラベル>ガソリンスタンド"},
  {"canonical_id": "ショップ>家具", "icon": "furniture", "name": "ショップ>家具"},
  {"canonical_id": "レストラン>居酒屋", "icon": "bar", "name": "レストラン>居酒屋"},
  {"canonical_id": "医療>歯科", "icon": "dentist", "name": "医療>歯科"},
  {"canonical_id": "生活>保険業", "icon": "bank", "name": "生活>保険業"},
  {"canonical_id": "レストラン>中華料理", "icon": "restaurant", "name": "レストラン>中華料理"},
  {"canonical_id": "生活>美容(その他)", "icon": "shop", "name": "生活>美容(その他)"},
  {"canonical_id": "生活>保育園", "icon": "shop", "name": "生活>保育園"},
  {"canonical_id": "生活>幼稚園", "icon": "school", "name": "生活>幼稚園"},
  {"canonical_id": "生活>弁護士", "icon": "shop", "name": "生活>弁護士"},
  {"canonical_id": "生活>銀行", "icon": "bank", "name": "生活>銀行"},
  {"canonical_id": "医療>眼科", "icon": "hospital-JP", "name": "医療>眼科"},
  {"canonical_id": "ショップ>カー用品", "icon": "shop", "name": "ショップ>カー用品"},
  {"canonical_id": "レストラン>寿司", "icon": "restaurant-sushi", "name": "レストラン>寿司"},
  {"canonical_id": "生活>小学校", "icon": "school", "name": "生活>小学校"},
  {"canonical_id": "生活>郵便局", "icon": "post", "name": "生活>郵便局"},
  {"canonical_id": "生活>コンサルタント", "icon": "building-alt1", "name": "生活>コンサルタント"},
  {"canonical_id": "レストラン>イタリアン", "icon": "restaurant", "name": "レストラン>イタリアン"},
  {"canonical_id": "レストラン>ピザ", "icon": "restaurant-pizza", "name": "レストラン>ピザ"},
  {"canonical_id": "生活>葬祭業", "icon": "cemetery", "name": "生活>葬祭業"},
  {"canonical_id": "生活>保育所", "icon": "shop", "name": "生活>保育所"},
  {"canonical_id": "医療>整体", "icon": "doctor", "name": "医療>整体"},
  {"canonical_id": "レストラン>スイーツ", "icon": "confectionery", "name": "レストラン>スイーツ"},
  {"canonical_id": "レストラン>ラーメン", "icon": "restaurant-noodle", "name": "レストラン>ラーメン"},
  {"canonical_id": "ショップ>花屋", "icon": "florist", "name": "ショップ>花屋"},
  {"canonical_id": "レストラン>焼肉", "icon": "restaurant", "name": "レストラン>焼肉"},
  {"canonical_id": "ショップ>化粧品", "icon": "shop", "name": "ショップ>化粧品"},
  {"canonical_id": "レストラン>韓国料理", "icon": "restaurant", "name": "レストラン>韓国料理"},
  {"canonical_id": "レジャー>スポーツジム", "icon": "fitness-centre", "name": "レジャー>スポーツジム"},
  {"canonical_id": "レストラン>ベーカリー", "icon": "bakery", "name": "レストラン>ベーカリー"},
  {"canonical_id": "生活>人材派遣", "icon": "shop", "name": "生活>人材派遣"},
  {"canonical_id": "医療>マッサージ", "icon": "doctor", "name": "医療>マッサージ"},
  {"canonical_id": "ショップ>ペット用品", "icon": "shop", "name": "ショップ>ペット用品"},
  {"canonical_id": "ショップ>中古車販売", "icon": "car", "name": "ショップ>中古車販売"},
  {"canonical_id": "生活>ネイルサロン", "icon": "shop", "name": "生活>ネイルサロン"},
  {"canonical_id": "生活>会計士", "icon": "shop", "name": "生活>会計士"},
  {"canonical_id": "トラベル>レンタカー", "icon": "car-rental", "name": "トラベル>レンタカー"},
  {"canonical_id": "ショップ>スポーツ用品", "icon": "shop", "name": "ショップ>スポーツ用品"},
  {"canonical_id": "生活>コインランドリー", "icon": "laundry", "name": "生活>コインランドリー"},
  {"canonical_id": "生活>児童施設", "icon": "shop", "name": "生活>児童施設"},
  {"canonical_id": "ショップ>八百屋", "icon": "grocery", "name": "ショップ>八百屋"},
  {"canonical_id": "医療>はり", "icon": "hospital-JP", "name": "医療>はり"},
  {"canonical_id": "レストラン>洋食", "icon": "restaurant", "name": "レストラン>洋食"},
  {"canonical_id": "レジャー>カラオケボックス", "icon": "karaoke", "name": "レジャー>カラオケボックス"},
  {"canonical_id": "ショップ>書籍", "icon": "library", "name": "ショップ>書籍"},
  {"canonical_id": "生活>レンタルショップ", "icon": "shop", "name": "生活>レンタルショップ"},
  {"canonical_id": "レジャー>美術館", "icon": "art-gallery", "name": "レジャー>美術館"},
  {"canonical_id": "レジャー>博物館", "icon": "museum", "name": "レジャー>博物館"},
  {"canonical_id": "生活>ドライクリーニング", "icon": "laundry", "name": "生活>ドライクリーニング"},
  {"canonical_id": "レジャー>牧場", "icon": "horse-riding", "name": "レジャー>牧場"},
  {"canonical_id": "レストラン>そば", "icon": "restaurant-noodle", "name": "レストラン>そば"},
  {"canonical_id": "トラベル>チャージステーション", "icon": "charging-station", "name": "トラベル>チャージステーション"},
  {"canonical_id": "レストラン>焼き鳥", "icon": "restaurant", "name": "レストラン>焼き鳥"},
  {"canonical_id": "ショップ>文房具", "icon": "shop", "name": "ショップ>文房具"},
  {"canonical_id": "トラベル>旅行代理店", "icon": "suitcase", "name": "トラベル>旅行代理店"},
  {"canonical_id": "ショップ>ディスカウントショップ", "icon": "shop", "name": "ショップ>ディスカウントショップ"},
  {"canonical_id": "レジャー>スポーツ競技場", "icon": "stadium", "name": "レジャー>スポーツ競技場"},
  {"canonical_id": "ショップ>靴", "icon": "shoe", "name": "ショップ>靴"},
  {"canonical_id": "レストラン>喫茶店（その他）", "icon": "cafe", "name": "レストラン>喫茶店（その他）"},
  {"canonical_id": "ショップ>電化製品", "icon": "shop", "name": "ショップ>電化製品"},
  {"canonical_id": "生活>宅配便", "icon": "shop", "name": "生活>宅配便"},
  {"canonical_id": "生活>倉庫", "icon": "warehouse", "name": "生活>倉庫"},
  {"canonical_id": "ショップ>ショッピングセンター", "icon": "shop", "name": "ショップ>ショッピングセンター"},
  {"canonical_id": "ショップ>釣り用品", "icon": "shop", "name": "ショップ>釣り用品"},
  {"canonical_id": "ショップ>携帯電話", "icon": "mobile-phone", "name": "ショップ>携帯電話"},
  {"canonical_id": "レストラン>フレンチ", "icon": "restaurant", "name": "レストラン>フレンチ"},
  {"canonical_id": "生活>語学学校", "icon": "school", "name": "生活>語学学校"},
  {"canonical_id": "レストラン>弁当", "icon": "restaurant", "name": "レストラン>弁当"},
  {"canonical_id": "トラベル>民宿", "icon": "lodging", "name": "トラベル>民宿"},
  {"canonical_id": "ショップ>カメラ", "icon": "shop", "name": "ショップ>カメラ"},
  {"canonical_id": "レストラン>ハンバーガー", "icon": "fast-food", "name": "レストラン>ハンバーガー"},
  {"canonical_id": "トラベル>公共の宿", "icon": "lodging", "name": "トラベル>公共の宿"},
  {"canonical_id": "ショップ>酒店", "icon": "alcohol-shop", "name": "ショップ>酒店"},
  {"canonical_id": "生活>消防機関", "icon": "fire-station", "name": "生活>消防機関"},
  {"canonical_id": "レジャー>ゴルフ", "icon": "golf", "name": "レジャー>ゴルフ"},
  {"canonical_id": "ショップ>ジュエリー", "icon": "shop", "name": "ショップ>ジュエリー"},
  {"canonical_id": "生活>警察機関", "icon": "police", "name": "生活>警察機関"},
  {"canonical_id": "生活>教会", "icon": "religious-christian", "name": "生活>教会"},
  {"canonical_id": "生活>動物病院", "icon": "shop", "name": "生活>動物病院"},
  {"canonical_id": "レストラン>ファミレス", "icon": "restaurant", "name": "レストラン>ファミレス"},
  {"canonical_id": "ショップ>ファッション(女性)", "icon": "clothing-store", "name": "ショップ>ファッション(女性)"},
  {"canonical_id": "ショップ>自転車", "icon": "bicycle", "name": "ショップ>自転車"},
  {"canonical_id": "トラベル>鉄道", "icon": "rail", "name": "トラベル>鉄道"},
  {"canonical_id": "トラベル>駅", "icon": "rail-metro", "name": "トラベル>駅"},
  {"canonical_id": "生活>霊園", "icon": "cemetery", "name": "生活>霊園"},
  {"canonical_id": "レジャー>カジノ", "icon": "casino", "name": "レジャー>カジノ"},
  {"canonical_id": "生活>金融(その他)", "icon": "shop", "name": "生活>金融(その他)"},
  {"canonical_id": "ショップ>おもちゃ", "icon": "shop", "name": "ショップ>おもちゃ"},
  {"canonical_id": "生活>アート教室", "icon": "school", "name": "生活>アート教室"},
  {"canonical_id": "生活>音楽教室", "icon": "music", "name": "生活>音楽教室"},
  {"canonical_id": "生活>大学", "icon": "college-JP", "name": "生活>大学"},
  {"canonical_id": "ショップ>たばこ", "icon": "shop", "name": "ショップ>たばこ"},
  {"canonical_id": "レストラン>インド料理", "icon": "restaurant", "name": "レストラン>インド料理"},
  {"canonical_id": "レストラン>シーフード", "icon": "restaurant-seafood", "name": "レストラン>シーフード"},
  {"canonical_id": "レストラン>お好み焼き", "icon": "restaurant", "name": "レストラン>お好み焼き"},
  {"canonical_id": "レストラン>丼もの", "icon": "restaurant", "name": "レストラン>丼もの"},
  {"canonical_id": "ショップ>音楽", "icon": "music", "name": "ショップ>音楽"},
  {"canonical_id": "生活>図書館", "icon": "library", "name": "生活>図書館"},
  {"canonical_id": "ショップ>バイク販売", "icon": "shop", "name": "ショップ>バイク販売"},
  {"canonical_id": "生活>ダンス教室", "icon": "school", "name": "生活>ダンス教室"},
  {"canonical_id": "ショップ>肉屋", "icon": "slaughterhouse", "name": "ショップ>肉屋"},
  {"canonical_id": "生活>短期大学", "icon": "college-JP", "name": "生活>短期大学"},
  {"canonical_id": "医療>内科", "icon": "doctor", "name": "医療>内科"},
  {"canonical_id": "ショップ>ホームセンター", "icon": "hardware", "name": "ショップ>ホームセンター"},
  {"canonical_id": "レストラン>アイスクリーム", "icon": "ice-cream", "name": "レストラン>アイスクリーム"},
  {"canonical_id": "生活>高等学校", "icon": "school", "name": "生活>高等学校"},
  {"canonical_id": "レジャー>ナイトクラブ", "icon": "nightclub", "name": "レジャー>ナイトクラブ"},
  {"canonical_id": "生活>洗車場", "icon": "car", "name": "生活>洗車場"},
  {"canonical_id": "レストラン>カレー", "icon": "restaurant", "name": "レストラン>カレー"},
  {"canonical_id": "レジャー>テーマパーク", "icon": "amusement-park", "name": "レジャー>テーマパーク"},
  {"canonical_id": "ショップ>質屋", "icon": "shop", "name": "ショップ>質屋"},
  {"canonical_id": "生活>ビデオレンタル", "icon": "cinema", "name": "生活>ビデオレンタル"},
  {"canonical_id": "生活>銭湯", "icon": "hot-spring", "name": "生活>銭湯"},
  {"canonical_id": "ショップ>百貨店", "icon": "commercial", "name": "ショップ>百貨店"},
  {"canonical_id": "レジャー>ヨガ", "icon": "fitness-centre", "name": "レジャー>ヨガ"},
  {"canonical_id": "医療>精神科", "icon": "hospital-JP", "name": "医療>精神科"},
  {"canonical_id": "レジャー>テニス", "icon": "tennis", "name": "レジャー>テニス"},
  {"canonical_id": "レジャー>野球", "icon": "baseball", "name": "レジャー>野球"},
  {"canonical_id": "ショップ>ファッション(男性)", "icon": "clothing-store", "name": "ショップ>ファッション(男性)"},
  {"canonical_id": "レストラン>アジアン料理", "icon": "restaurant", "name": "レストラン>アジアン料理"},
  {"canonical_id": "生活>神社", "icon": "religious-shinto", "name": "生活>神社"},
  {"canonical_id": "生活>温泉浴場", "icon": "hot-spring", "name": "生活>温泉浴場"},
  {"canonical_id": "トラベル>タクシー", "icon": "taxi", "name": "トラベル>タクシー"},
  {"canonical_id": "レストラン>ステーキ", "icon": "restaurant", "name": "レストラン>ステーキ"},
  {"canonical_id": "生活>中学校", "icon": "school", "name": "生活>中学校"},
  {"canonical_id": "トラベル>サービスエリア", "icon": "highway-rest-area", "name": "トラベル>サービスエリア"},
  {"canonical_id": "レストラン>とんかつ", "icon": "restaurant", "name": "レストラン>とんかつ"},
  {"canonical_id": "ショップ>メガネ", "icon": "optician", "name": "ショップ>メガネ"},
  {"canonical_id": "レストラン>サンドイッチ", "icon": "restaurant", "name": "レストラン>サンドイッチ"},
  {"canonical_id": "生活>専門学校", "icon": "school", "name": "生活>専門学校"},
  {"canonical_id": "レストラン>うなぎ", "icon": "restaurant-seafood", "name": "レストラン>うなぎ"},
  {"canonical_id": "医療>小児科", "icon": "hospital-JP", "name": "医療>小児科"},
  {"canonical_id": "レジャー>キャンプ場", "icon": "campsite", "name": "レジャー>キャンプ場"},
  {"canonical_id": "レストラン>タイ料理", "icon": "restaurant", "name": "レストラン>タイ料理"},
  {"canonical_id": "生活>自動車教習所", "icon": "school", "name": "生活>自動車教習所"},
  {"canonical_id": "ショップ>チケット販売", "icon": "shop", "name": "ショップ>チケット販売"},
  {"canonical_id": "トラベル>観光案内", "icon": "information", "name": "トラベル>観光案内"},
  {"canonical_id": "レジャー>水泳場", "icon": "swimming", "name": "レジャー>水泳場"},
  {"canonical_id": "ショップ>リサイクル", "icon": "recycling", "name": "ショップ>リサイクル"},
  {"canonical_id": "生活>運送", "icon": "suitcase", "name": "生活>運送"},
  {"canonical_id": "レストラン>しゃぶしゃぶ", "icon": "restaurant", "name": "レストラン>しゃぶしゃぶ"},
  {"canonical_id": "レストラン>ワインバー", "icon": "bar", "name": "レストラン>ワインバー"},
  {"canonical_id": "レストラン>餃子", "icon": "restaurant", "name": "レストラン>餃子"},
  {"canonical_id": "レストラン>鍋料理", "icon": "restaurant", "name": "レストラン>鍋料理"},
  {"canonical_id": "医療>皮膚科", "icon": "hospital-JP", "name": "医療>皮膚科"},
  {"canonical_id": "レジャー>音楽ホール", "icon": "music", "name": "レジャー>音楽ホール"},
  {"canonical_id": "医療>耳鼻咽喉科", "icon": "hospital-JP", "name": "医療>耳鼻咽喉科"},
  {"canonical_id": "レジャー>劇場", "icon": "theatre", "name": "レジャー>劇場"},
  {"canonical_id": "レジャー>屋内スポーツ", "icon": "fitness-centre", "name": "レジャー>屋内スポーツ"},
  {"canonical_id": "医療>産婦人科", "icon": "hospital-JP", "name": "医療>産婦人科"},
  {"canonical_id": "レジャー>映画館", "icon": "cinema", "name": "レジャー>映画館"},
  {"canonical_id": "レストラン>串揚げ", "icon": "restaurant", "name": "レストラン>串揚げ"},
  {"canonical_id": "医療>外科", "icon": "hospital-JP", "name": "医療>外科"},
  {"canonical_id": "レストラン>もつ鍋", "icon": "restaurant", "name": "レストラン>もつ鍋"},
  {"canonical_id": "レストラン>ドーナツ", "icon": "bakery", "name": "レストラン>ドーナツ"},
  {"canonical_id": "ショップ>子ども服", "icon": "clothing-store", "name": "ショップ>子ども服"},
  {"canonical_id": "生活>政治団体", "icon": "shop", "name": "生活>政治団体"},
  {"canonical_id": "ショップ>アンティーク", "icon": "shop", "name": "ショップ>アンティーク"},
  {"canonical_id": "医療>リハビリ", "icon": "hospital-JP", "name": "医療>リハビリ"},
  {"canonical_id": "レストラン>うどん", "icon": "restaurant-noodle", "name": "レストラン>うどん"},
  {"canonical_id": "ショップ>ギフト", "icon": "shop", "name": "ショップ>ギフト"},
  {"canonical_id": "レジャー>スキー", "icon": "skiing", "name": "レジャー>スキー"},
  {"canonical_id": "レジャー>ゲームセンター", "icon": "gaming", "name": "レジャー>ゲームセンター"},
  {"canonical_id": "レストラン>メキシコ料理", "icon": "restaurant", "name": "レストラン>メキシコ料理"},
  {"canonical_id": "レストラン>ビアレストラン", "icon": "beer", "name": "レストラン>ビアレストラン"},
  {"canonical_id": "生活>ボランティア活動", "icon": "shop", "name": "生活>ボランティア活動"},
  {"canonical_id": "トラベル>航空", "icon": "airfield", "name": "トラベル>航空"},
  {"canonical_id": "ショップ>魚屋", "icon": "shop", "name": "ショップ>魚屋"},
  {"canonical_id": "レストラン>和菓子", "icon": "confectionery", "name": "レストラン>和菓子"},
  {"canonical_id": "レストラン>鳥料理", "icon": "restaurant", "name": "レストラン>鳥料理"},
  {"canonical_id": "レジャー>サッカー", "icon": "soccer", "name": "レジャー>サッカー"},
  {"canonical_id": "レジャー>ネットカフェ", "icon": "cafe", "name": "レジャー>ネットカフェ"},
  {"canonical_id": "レストラン>たこ焼き", "icon": "restaurant", "name": "レストラン>たこ焼き"},
  {"canonical_id": "トラベル>フェリー", "icon": "ferry", "name": "トラベル>フェリー"},
  {"canonical_id": "生活>印刷(その他)", "icon": "shop", "name": "生活>印刷(その他)"},
  {"canonical_id": "レストラン>日本料理", "icon": "restaurant", "name": "レストラン>日本料理"},
  {"canonical_id": "レストラン>天ぷら", "icon": "restaurant", "name": "レストラン>天ぷら"},
  {"canonical_id": "レジャー>動物園", "icon": "zoo", "name": "レジャー>動物園"},
  {"canonical_id": "レストラン>ブラジル料理", "icon": "restaurant", "name": "レストラン>ブラジル料理"},
  {"canonical_id": "生活>環境", "icon": "shop", "name": "生活>環境"},
  {"canonical_id": "ショップ>パソコン", "icon": "shop", "name": "ショップ>パソコン"},
  {"canonical_id": "生活>エステ", "icon": "shop", "name": "生活>エステ"},
  {"canonical_id": "医療>きゅう", "icon": "hospital-JP", "name": "医療>きゅう"},
  {"canonical_id": "レストラン>地中海料理", "icon": "restaurant", "name": "レストラン>地中海料理"},
  {"canonical_id": "レジャー>水族館", "icon": "aquarium", "name": "レジャー>水族館"},
  {"canonical_id": "レストラン>炭火焼料理", "icon": "restaurant", "name": "レストラン>炭火焼料理"},
  {"canonical_id": "レストラン>すき焼き", "icon": "restaurant", "name": "レストラン>すき焼き"},
  {"canonical_id": "レストラン>ちゃんこ鍋", "icon": "restaurant", "name": "レストラン>ちゃんこ鍋"},
  {"canonical_id": "レストラン>もんじゃ", "icon": "restaurant", "name": "レストラン>もんじゃ"},
  {"canonical_id": "レストラン>串かつ", "icon": "restaurant", "name": "レストラン>串かつ"},
  {"canonical_id": "レストラン>かに", "icon": "restaurant-seafood", "name": "レストラン>かに"},
  {"canonical_id": "レストラン>ビュッフェ", "icon": "restaurant", "name": "レストラン>ビュッフェ"},
  {"canonical_id": "レストラン>パスタ", "icon": "restaurant", "name": "レストラン>パスタ"},
  {"canonical_id": "レストラン>デリカテッセン", "icon": "shop", "name": "レストラン>デリカテッセン"},
  {"canonical_id": "トラベル>レンタサイクル", "icon": "bicycle-share", "name": "トラベル>レンタサイクル"},
  {"canonical_id": "レストラン>ケータリング", "icon": "restaurant", "name": "レストラン>ケータリング"},
  {"canonical_id": "レストラン>創作料理", "icon": "restaurant", "name": "レストラン>創作料理"},
  {"canonical_id": "レストラン>バイキング", "icon": "restaurant", "name": "レストラン>バイキング"},
  {"canonical_id": "レジャー>パチンコ", "icon": "gaming", "name": "レジャー>パチンコ"},
  {"canonical_id": "レジャー>パチンコ店", "icon": "gaming", "name": "レジャー>パチンコ店"},
  {"canonical_id": "生活>写真関連", "icon": "shop", "name": "生活>写真関連"},
  {"canonical_id": "レストラン>鉄板焼き", "icon": "restaurant", "name": "レストラン>鉄板焼き"},
  {"canonical_id": "レストラン>懐石", "icon": "restaurant", "name": "レストラン>懐石"},
  {"canonical_id": "トラベル>ペンション", "icon": "lodging", "name": "トラベル>ペンション"},
  {"canonical_id": "レストラン>ロシア料理", "icon": "restaurant", "name": "レストラン>ロシア料理"},
  {"canonical_id": "レストラン>郷土料理", "icon": "restaurant", "name": "レストラン>郷土料理"},
  {"canonical_id": "レストラン>割烹", "icon": "restaurant", "name": "レストラン>割烹"},
  {"canonical_id": "レストラン>豆腐", "icon": "restaurant", "name": "レストラン>豆腐"},
  {"canonical_id": "レストラン>ベトナム料理", "icon": "restaurant", "name": "レストラン>ベトナム料理"},
  {"canonical_id": "レストラン>野菜料理", "icon": "restaurant", "name": "レストラン>野菜料理"},
  {"canonical_id": "レストラン>魚料理", "icon": "restaurant-seafood", "name": "レストラン>魚料理"},
  {"canonical_id": "レストラン>てんぷら", "icon": "restaurant", "name": "レストラン>てんぷら"},
  {"canonical_id": "レストラン>スペイン料理", "icon": "restaurant", "name": "レストラン>スペイン料理"},
  {"canonical_id": "ショップ>バラエティショップ", "icon": "shop", "name": "ショップ>バラエティショップ"},
  {"canonical_id": "レストラン>中東料理", "icon": "restaurant", "name": "レストラン>中東料理"},
  {"canonical_id": "レストラン>トルコ料理", "icon": "restaurant", "name": "レストラン>トルコ料理"},
  {"canonical_id": "レストラン>沖縄料理", "icon": "restaurant", "name": "レストラン>沖縄料理"},
  {"canonical_id": "レストラン>ジャマイカ料理", "icon": "restaurant", "name": "レストラン>ジャマイカ料理"},
  {"canonical_id": "レストラン>フィリピン料理", "icon": "restaurant", "name": "レストラン>フィリピン料理"},
  {"canonical_id": "レストラン>バッフェ", "icon": "restaurant", "name": "レストラン>バッフェ"},
  {"canonical_id": "レストラン>アメリカ料理", "icon": "restaurant", "name": "レストラン>アメリカ料理"},
  {"canonical_id": "レストラン>ハワイアン", "icon": "restaurant", "name": "レストラン>ハワイアン"},
  {"canonical_id": "レストラン>ふぐ", "icon": "restaurant-seafood", "name": "レストラン>ふぐ"},
  {"canonical_id": "レストラン>アルゼンチン料理", "icon": "restaurant", "name": "レストラン>アルゼンチン料理"},
  {"canonical_id": "レストラン>デンマーク料理", "icon": "restaurant", "name": "レストラン>デンマーク料理"},
  {"canonical_id": "レストラン>インドネシア料理", "icon": "restaurant", "name": "レストラン>インドネシア料理"},
  {"canonical_id": "レストラン>イギリス料理", "icon": "restaurant", "name": "レストラン>イギリス料理"},
  {"canonical_id": "レストラン>ポーランド料理", "icon": "restaurant", "name": "レストラン>ポーランド料理"},
  {"canonical_id": "レストラン>ペルー料理", "icon": "restaurant", "name": "レストラン>ペルー料理"},
  {"canonical_id": "レストラン>バングラデシュ料理", "icon": "restaurant", "name": "レストラン>バングラデシュ料理"},
  {"canonical_id": "レストラン>ベルギー料理", "icon": "restaurant", "name": "レストラン>ベルギー料理"},
  {"canonical_id": "レストラン>ヨーロッパ料理", "icon": "restaurant", "name": "レストラン>ヨーロッパ料理"},
  {"canonical_id": "レストラン>マレーシア料理", "icon": "restaurant", "name": "レストラン>マレーシア料理"},
  {"canonical_id": "レストラン>モンゴル料理", "icon": "restaurant", "name": "レストラン>モンゴル料理"},
  {"canonical_id": "レストラン>キューバ料理", "icon": "restaurant", "name": "レストラン>キューバ料理"},
  {"canonical_id": "レストラン>ケイジャン料理", "icon": "restaurant", "name": "レストラン>ケイジャン料理"},
  {"canonical_id": "レストラン>カナダ料理", "icon": "restaurant", "name": "レストラン>カナダ料理"},
  {"canonical_id": "レストラン>オーストラリア料理", "icon": "restaurant", "name": "レストラン>オーストラリア料理"},
  {"canonical_id": "レストラン>ユダヤ料理", "icon": "restaurant", "name": "レストラン>ユダヤ料理"},
  {"canonical_id": "レストラン>北欧料理", "icon": "restaurant", "name": "レストラン>北欧料理"},
  {"canonical_id": "レストラン>エジプト料理", "icon": "restaurant", "name": "レストラン>エジプト料理"},
  {"canonical_id": "レストラン>ドイツ料理", "icon": "restaurant", "name": "レストラン>ドイツ料理"},
  {"canonical_id": "レストラン>スリランカ料理", "icon": "restaurant", "name": "レストラン>スリランカ料理"},
  {"canonical_id": "レストラン>ケバブ", "icon": "restaurant", "name": "レストラン>ケバブ"},
  {"canonical_id": "レストラン>台湾料理", "icon": "restaurant", "name": "レストラン>台湾料理"},
  {"canonical_id": "レストラン>ネパール料理", "icon": "restaurant", "name": "レストラン>ネパール料理"},
  {"canonical_id": "レストラン>ミャンマー料理", "icon": "restaurant", "name": "レストラン>ミャンマー料理"},
  {"canonical_id": "レストラン>アフガニスタン料理", "icon": "restaurant", "name": "レストラン>アフガニスタン料理"},
  {"canonical_id": "レストラン>シンガポール料理", "icon": "restaurant", "name": "レストラン>シンガポール料理"}
];

// Initialize map centered on Tokyo
// Access token is already set in utils.js

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [139.6917, 35.6895], // Tokyo coordinates
    zoom: 11,
    language: 'ja' // Set language to Japanese
});

// Store for markers and current results
let markers = [];
let currentResults = [];
let categories = [];
let nestedCategories = {};
let selectedCategories = new Set();
let centerMarker = null;
let filteredCategories = [];
let dropdownVisible = false;
let expandedPaths = new Set();

// Color palette for different categories (up to 10 distinct colors)
const categoryColors = [
    '#4285f4', // Blue
    '#ea4335', // Red
    '#fbbc04', // Yellow
    '#34a853', // Green
    '#ff6d00', // Orange
    '#ab47bc', // Purple
    '#00acc1', // Cyan
    '#ff4081', // Pink
    '#43a047', // Dark Green
    '#7b1fa2', // Dark Purple
];

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Function to update center marker
function updateCenterMarker() {
    const center = map.getCenter();

    // Remove existing center marker if it exists
    if (centerMarker) {
        centerMarker.remove();
    }

    // Create center marker element
    const centerEl = document.createElement('div');
    centerEl.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #ff4444;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        position: relative;
    `;

    // Add a pulse animation
    const pulseEl = document.createElement('div');
    pulseEl.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #ff4444;
        opacity: 0.5;
        position: absolute;
        top: -3px;
        left: -3px;
        animation: pulse 2s ease-out infinite;
    `;
    centerEl.appendChild(pulseEl);

    // Create the center marker with popup
    centerMarker = new mapboxgl.Marker(centerEl, { anchor: 'center' })
        .setLngLat(center)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div style="padding: 5px;">
                <strong>検索中心点</strong><br>
                <span style="font-size: 11px; color: #666;">緯度: ${center.lat.toFixed(6)}<br>経度: ${center.lng.toFixed(6)}</span>
            </div>`))
        .addTo(map);
}

// Add CSS for pulse animation and custom styles
const customStyles = document.createElement('style');
customStyles.textContent = `
    .mapboxgl-popup {
        opacity: 1 !important;
    }

    .mapboxgl-popup-content {
        opacity: 1 !important;
        background-color: white !important;
        background: white !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
    }

    .mapboxgl-popup-content div {
        opacity: 1 !important;
    }

    .mapboxgl-popup-tip {
        opacity: 1 !important;
    }

    .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
        border-top-color: white !important;
    }

    .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
        border-bottom-color: white !important;
    }

    .mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
        border-right-color: white !important;
    }

    .mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
        border-left-color: white !important;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.5;
        }
        50% {
            transform: scale(2);
            opacity: 0.2;
        }
        100% {
            transform: scale(3);
            opacity: 0;
        }
    }


    .dropdown-item {
        padding: 8px 10px;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.2s;
        display: flex;
        align-items: center;
    }

    .dropdown-item:hover {
        background: #f5f5f5;
    }

    .dropdown-item.highlighted {
        background: #e8f0fe;
    }

    .dropdown-item.selected {
        font-weight: 500;
    }

    .dropdown-item input[type="checkbox"] {
        margin-right: 8px;
    }

    .group-header {
        padding: 8px 10px;
        cursor: pointer;
        font-weight: 500;
        font-size: 13px;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background 0.2s;
        border-radius: 4px;
    }

    .group-header:hover {
        background: #f0f0f0;
    }

    .group-header .arrow {
        transition: transform 0.2s;
        margin-right: 8px;
        font-size: 10px;
        flex-shrink: 0;
    }

    .group-header.expanded .arrow {
        transform: rotate(90deg);
    }

    .group-header.has-children {
        font-weight: 600;
    }

    .nested-group {
        margin-left: 0;
    }

    .nested-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
    }

    .nested-content.expanded {
        max-height: 2000px;
        transition: max-height 0.3s ease-in;
    }

    .group-count {
        background: #e0e0e0;
        color: #666;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 11px;
        margin-left: auto;
    }

    .group-checkbox {
        margin-right: 8px;
        flex-shrink: 0;
    }

    .search-input-wrapper {
        position: relative;
    }

    .dropdown-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 500px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: none;
    }

    .dropdown-list.visible {
        display: block;
    }

    /* Custom scrollbar for results */
    #results::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    #results::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 4px;
    }

    #results::-webkit-scrollbar-thumb {
        background: #bbb;
        border-radius: 4px;
    }

    #results::-webkit-scrollbar-thumb:hover {
        background: #999;
    }

    .select-all-none {
        padding: 8px 10px;
        border-bottom: 1px solid #e0e0e0;
        background: #fff;
        display: flex;
        gap: 10px;
        font-size: 12px;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .select-all-none button {
        background: white;
        border: 1px solid #ddd;
        padding: 6px;
        border-radius: 4px;
        cursor: pointer;
        color: #4285f4;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
    }

    .select-all-none button:hover {
        background: #e8f0fe;
        border-color: #4285f4;
    }

    .select-all-none button svg {
        pointer-events: none;
    }

    /* Level-based indentation */
    .level-0 { padding-left: 10px; }
    .level-1 { padding-left: 30px; background: #fafafa; }
    .level-2 { padding-left: 50px; background: #f5f5f5; }
    .level-3 { padding-left: 70px; background: #f0f0f0; }
    .level-4 { padding-left: 90px; background: #ebebeb; }

    .category-path {
        font-size: 10px;
        color: #999;
        margin-left: 8px;
    }

    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translate(-50%, -40%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }

    .category-chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        background: white;
        border: 1px solid #4285f4;
        border-radius: 20px;
        font-size: 13px;
        color: #4285f4;
        gap: 6px;
        animation: chipAppear 0.2s ease;
    }

    .category-chip .remove-btn {
        cursor: pointer;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #4285f4;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: background 0.2s;
    }

    .category-chip .remove-btn:hover {
        background: #3367d6;
    }

    @keyframes chipAppear {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    /* Smooth scrolling for results */
    #results {
        scroll-behavior: smooth;
    }

    /* Enhanced scrollbar for results - override previous styles */
    #results::-webkit-scrollbar {
        width: 10px !important;
    }

    #results::-webkit-scrollbar-track {
        background: #f5f5f5 !important;
        border-radius: 10px !important;
        margin: 4px !important;
    }

    #results::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 10px !important;
        border: 2px solid #f5f5f5 !important;
    }

    #results::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #764ba2 0%, #667eea 100%) !important;
    }
`;
document.head.appendChild(customStyles);

// Function to build nested category structure
function buildNestedStructure(categories) {
    const root = {
        name: 'root',
        children: {},
        items: [],
        count: 0,
        selected: 0
    };

    categories.forEach(category => {
        const name = category.name || category.canonical_id;
        const parts = name.split('>').map(p => p.trim());

        let current = root;
        let path = [];

        // Navigate/create the tree structure
        parts.forEach((part, index) => {
            path.push(part);

            if (index === parts.length - 1) {
                // This is a leaf item
                current.items.push({
                    ...category,
                    displayName: part,
                    fullPath: path.join(' > '),
                    pathArray: [...path]
                });
                current.count++;
            } else {
                // This is a group
                if (!current.children[part]) {
                    current.children[part] = {
                        name: part,
                        children: {},
                        items: [],
                        count: 0,
                        selected: 0,
                        fullPath: path.join(' > ')
                    };
                }
                current = current.children[part];
            }
        });
    });

    // Calculate counts recursively
    function calculateCounts(node) {
        let totalCount = node.items.length;
        let totalSelected = node.items.filter(item =>
            selectedCategories.has(item.canonical_id)
        ).length;

        Object.values(node.children).forEach(child => {
            const [childCount, childSelected] = calculateCounts(child);
            totalCount += childCount;
            totalSelected += childSelected;
        });

        node.count = totalCount;
        node.selected = totalSelected;
        return [totalCount, totalSelected];
    }

    calculateCounts(root);
    return root;
}

// Function to initialize categories (using static list)
function initializeCategories() {
    try {
        console.log('Initializing categories from static list...');

        // Use the static categories defined at the top of the file
        categories = STATIC_CATEGORIES;

        // Build nested structure
        nestedCategories = buildNestedStructure(categories);

        // Initialize expanded state for top-level groups
        Object.keys(nestedCategories.children).forEach(key => {
            expandedPaths.add(key);
        });

        // Create multi-select UI
        createMultiSelectUI(categories);

        console.log(`Loaded ${categories.length} categories from static list`);

    } catch (error) {
        console.error('Error initializing categories:', error);
        // Show error in status area
        const statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.textContent = 'カテゴリーの初期化に失敗しました';
            statusDiv.style.background = '#fee';
            statusDiv.style.color = '#c00';
        }
    }
}

// Function to create multi-select UI
function createMultiSelectUI(categories) {
    // Create control container
    const controlContainer = document.createElement('div');
    controlContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    controlContainer.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        bottom: 10px;
        background: white;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 0 0 2px rgba(0,0,0,.1);
        width: 400px;
        z-index: 1;
        max-height: calc(100vh - 40px);
        height: calc(100vh - 40px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;

    // Create title
    const title = document.createElement('h3');
    title.textContent = 'SearchBox カテゴリー検索';
    title.style.cssText = 'margin: 0 0 10px 0; font-size: 14px; color: #333; flex-shrink: 0;';
    controlContainer.appendChild(title);

    // Create button container for side-by-side layout
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
    `;

    // Create button to open category modal
    const openModalButton = document.createElement('button');
    openModalButton.innerHTML = '📋 カテゴリーを選択';
    openModalButton.id = 'open-modal-button';
    openModalButton.style.cssText = `
        flex: 1;
        padding: 10px;
        background: white;
        color: #4285f4;
        border: 2px solid #4285f4;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    `;
    openModalButton.onmouseover = () => {
        openModalButton.style.background = '#e8f0fe';
    };
    openModalButton.onmouseout = () => {
        openModalButton.style.background = 'white';
    };
    openModalButton.onclick = () => showCategoryModal();
    buttonContainer.appendChild(openModalButton);

    // Create search button
    const searchButton = document.createElement('button');
    searchButton.textContent = '検索';
    searchButton.id = 'search-button';
    searchButton.style.cssText = `
        flex: 1;
        padding: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    `;
    searchButton.onmouseover = () => {
        searchButton.style.transform = 'translateY(-2px)';
        searchButton.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
    };
    searchButton.onmouseout = () => {
        searchButton.style.transform = 'translateY(0)';
        searchButton.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
    };
    searchButton.onclick = performSearch;
    buttonContainer.appendChild(searchButton);

    controlContainer.appendChild(buttonContainer);

    // Create chips container (restored under search button)
    const chipsContainer = document.createElement('div');
    chipsContainer.id = 'chips-container';
    chipsContainer.style.cssText = `
        min-height: 80px;
        max-height: 200px;
        overflow-y: auto;
        margin-bottom: 10px;
        padding: 8px;
        background: #f8f9fa;
        border-radius: 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: flex-start;
        align-content: flex-start;
        border: 1px solid #e0e0e0;
        flex-shrink: 0;
    `;

    const placeholder = document.createElement('span');
    placeholder.textContent = 'カテゴリーを選択してください';
    placeholder.style.cssText = 'color: #999; font-size: 13px;';
    placeholder.id = 'chips-placeholder';
    chipsContainer.appendChild(placeholder);

    controlContainer.appendChild(chipsContainer);

    // Create modal container
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'category-modal-overlay';
    modalOverlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.id = 'category-modal-content';
    modalContent.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 600px;
        height: 80vh;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        animation: slideInUp 0.3s ease;
    `;

    // Modal header
    const modalHeader = document.createElement('div');
    modalHeader.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
    `;

    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'カテゴリーを選択';
    modalTitle.style.cssText = 'margin: 0; color: #333; font-size: 18px;';
    modalHeader.appendChild(modalTitle);

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✖';
    closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
    `;
    closeButton.onmouseover = () => {
        closeButton.style.background = '#f0f0f0';
        closeButton.style.color = '#333';
    };
    closeButton.onmouseout = () => {
        closeButton.style.background = 'none';
        closeButton.style.color = '#666';
    };
    closeButton.onclick = () => hideCategoryModal();
    modalHeader.appendChild(closeButton);

    modalContent.appendChild(modalHeader);

    // Modal body with search input wrapper
    const modalBody = document.createElement('div');
    modalBody.style.cssText = `
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    `;

    // Create search input for modal
    const modalSearchWrapper = document.createElement('div');
    modalSearchWrapper.style.cssText = 'margin-bottom: 15px;';

    const modalSearchInput = document.createElement('input');
    modalSearchInput.type = 'text';
    modalSearchInput.placeholder = '🔍 カテゴリーを検索';
    modalSearchInput.id = 'modal-category-search';
    modalSearchInput.style.cssText = `
        width: 100%;
        padding: 12px;
        font-size: 14px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        box-sizing: border-box;
        transition: border-color 0.2s;
    `;
    modalSearchInput.onfocus = () => {
        modalSearchInput.style.borderColor = '#4285f4';
    };
    modalSearchInput.onblur = () => {
        modalSearchInput.style.borderColor = '#e0e0e0';
    };
    modalSearchWrapper.appendChild(modalSearchInput);
    modalBody.appendChild(modalSearchWrapper);

    // Create category list container for modal
    const categoryListContainer = document.createElement('div');
    categoryListContainer.id = 'modal-category-list';
    categoryListContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: white;
    `;
    modalBody.appendChild(categoryListContainer);

    modalContent.appendChild(modalBody);

    // Modal footer
    const modalFooter = document.createElement('div');
    modalFooter.style.cssText = `
        padding: 15px 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        background: #f8f9fa;
    `;

    const selectionInfo = document.createElement('span');
    selectionInfo.id = 'modal-selection-info';
    selectionInfo.style.cssText = 'color: #666; font-size: 14px;';
    selectionInfo.textContent = '0個選択中';
    modalFooter.appendChild(selectionInfo);

    const modalActions = document.createElement('div');
    modalActions.style.cssText = 'display: flex; gap: 10px;';

    const applyButton = document.createElement('button');
    applyButton.textContent = '適用';
    applyButton.style.cssText = `
        padding: 10px 24px;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        line-height: 1.2;
        min-height: 36px;
    `;
    applyButton.onclick = () => {
        hideCategoryModal();
        updateSearchButton();
    };
    modalActions.appendChild(applyButton);

    modalFooter.appendChild(modalActions);
    modalContent.appendChild(modalFooter);

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Add results container
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'results';
    resultsDiv.style.cssText = `
        margin-top: 10px;
        flex: 1;
        overflow-y: auto;
        min-height: 100px;
        border-top: 1px solid #e0e0e0;
        padding-top: 10px;
        padding-right: 5px;
    `;
    controlContainer.appendChild(resultsDiv);

    // Add to map
    document.getElementById('map').appendChild(controlContainer);

    // Set up event listeners
    setupEventListeners();
}

// Function to set up event listeners
function setupEventListeners() {
    // Modal search input event
    const modalSearchInput = document.getElementById('modal-category-search');
    if (modalSearchInput) {
        modalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            updateModalCategoryList(query);
        });
    }

    // Modal overlay click to close
    const modalOverlay = document.getElementById('category-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideCategoryModal();
            }
        });
    }

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.style.display === 'block') {
            hideCategoryModal();
        }
    });
}

// Function to render nested group recursively
function renderNestedGroup(node, path = [], level = 0) {
    const elements = [];
    const currentPath = [...path, node.name].filter(p => p !== 'root').join('>');

    // Render child groups first
    Object.entries(node.children).forEach(([name, childNode]) => {
        const childPath = [...path, node.name].filter(p => p !== 'root');
        childPath.push(name);
        const pathString = childPath.join('>');

        // Create group container
        const groupContainer = document.createElement('div');
        groupContainer.className = 'nested-group';
        groupContainer.style.marginLeft = `${level * 20}px`;

        // Create group header
        const header = document.createElement('div');
        header.className = `group-header level-${Math.min(level, 4)} ${expandedPaths.has(pathString) ? 'expanded' : ''}`;

        const hasSubGroups = Object.keys(childNode.children).length > 0;
        if (hasSubGroups) {
            header.classList.add('has-children');
        }

        const selectedInGroup = childNode.selected;
        const totalInGroup = childNode.count;

        header.innerHTML = `
            <div style="display: flex; align-items: center; flex: 1;">
                ${hasSubGroups || childNode.items.length > 0 ? '<span class="arrow">▶</span>' : '<span style="width: 14px;"></span>'}
                <input type="checkbox" class="group-checkbox"
                    ${selectedInGroup === totalInGroup && totalInGroup > 0 ? 'checked' : ''}
                    ${selectedInGroup > 0 && selectedInGroup < totalInGroup ? 'indeterminate' : ''}
                    onclick="toggleGroupSelection(event, '${pathString.replace(/'/g, "\\'")}')"
                />
                <strong>${name}</strong>
                ${level > 0 ? `<span class="category-path">${childPath.slice(0, -1).join(' > ')}</span>` : ''}
            </div>
            <span class="group-count">${selectedInGroup}/${totalInGroup}</span>
        `;

        // Set indeterminate state properly
        const checkbox = header.querySelector('.group-checkbox');
        if (checkbox && selectedInGroup > 0 && selectedInGroup < totalInGroup) {
            setTimeout(() => { checkbox.indeterminate = true; }, 0);
        }

        header.onclick = (e) => {
            if (!e.target.matches('.group-checkbox')) {
                togglePath(pathString);
            }
        };

        groupContainer.appendChild(header);

        // Create nested content container
        const contentContainer = document.createElement('div');
        contentContainer.className = `nested-content ${expandedPaths.has(pathString) ? 'expanded' : ''}`;

        // Render sub-groups recursively
        const subElements = renderNestedGroup(childNode, childPath, level + 1);
        subElements.forEach(el => contentContainer.appendChild(el));

        // Render items in this group
        childNode.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = `dropdown-item level-${Math.min(level + 1, 4)}`;

            const isSelected = selectedCategories.has(item.canonical_id);

            itemEl.innerHTML = `
                <input type="checkbox" ${isSelected ? 'checked' : ''} />
                <span style="${isSelected ? 'font-weight: 500;' : ''}">${item.displayName}</span>
                ${level > 0 ? `<span class="category-path">${item.pathArray.slice(0, -1).join(' > ')}</span>` : ''}
            `;

            itemEl.onclick = (e) => {
                e.stopPropagation();
                selectCategory(item);
            };

            contentContainer.appendChild(itemEl);
        });

        groupContainer.appendChild(contentContainer);
        elements.push(groupContainer);
    });

    // Render direct items (not in subgroups)
    node.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = `dropdown-item level-${Math.min(level, 4)}`;

        const isSelected = selectedCategories.has(item.canonical_id);

        itemEl.innerHTML = `
            <input type="checkbox" ${isSelected ? 'checked' : ''} />
            <span style="${isSelected ? 'font-weight: 500;' : ''}">${item.displayName}</span>
        `;

        itemEl.onclick = (e) => {
            e.stopPropagation();
            selectCategory(item);
        };

        elements.push(itemEl);
    });

    return elements;
}

// Function to show nested categories
function showNestedCategories() {
    const dropdownList = document.getElementById('category-dropdown-list');
    dropdownList.innerHTML = '';

    // Rebuild structure with current selections
    nestedCategories = buildNestedStructure(categories);

    // Add select all/none buttons
    const selectControls = document.createElement('div');
    selectControls.className = 'select-all-none';

    // Determine if there are any groups to expand/collapse
    const hasExpandableGroups = Object.keys(nestedCategories.children || {}).length > 0;
    const isExpanded = expandedPaths.size > 0;
    const hasSelection = selectedCategories.size > 0;

    selectControls.innerHTML = `
        <button onclick="toggleAllSelection(event)" title="${hasSelection ? '選択解除' : 'すべて選択'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                ${hasSelection ? '' : '<polyline points="9 11 12 14 15 10"/>'}
            </svg>
        </button>
        ${hasExpandableGroups ? `
        <button onclick="toggleAllExpanded(event)" title="${isExpanded ? 'すべて折りたたむ' : 'すべて展開'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${isExpanded ?
                    '<polyline points="7 14 12 9 17 14"/>' :
                    '<polyline points="7 10 12 15 17 10"/>'}
            </svg>
        </button>` : ''}
        <span style="margin-left: auto; color: #666;">
            ${selectedCategories.size} / ${categories.length} 選択中
        </span>
    `;
    dropdownList.appendChild(selectControls);

    // Render nested structure
    const elements = renderNestedGroup(nestedCategories);
    elements.forEach(el => dropdownList.appendChild(el));

    showDropdown();
}

// Function to toggle path expansion
function togglePath(path) {
    if (expandedPaths.has(path)) {
        expandedPaths.delete(path);
    } else {
        expandedPaths.add(path);
    }
    showNestedCategories();
}

// Function to toggle all expanded/collapsed
window.toggleAllExpanded = function(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    if (expandedPaths.size > 0) {
        // Collapse all
        expandedPaths.clear();
    } else {
        // Expand all - find all paths that have children
        function findAllPaths(node, currentPath = '') {
            const paths = [];
            if (node.children && Object.keys(node.children).length > 0) {
                for (const [childName, childNode] of Object.entries(node.children)) {
                    const childPath = currentPath ? `${currentPath}>${childName}` : childName;
                    paths.push(childPath);
                    paths.push(...findAllPaths(childNode, childPath));
                }
            }
            return paths;
        }

        const allPaths = findAllPaths(nestedCategories);
        expandedPaths = new Set(allPaths);
    }
    showNestedCategories();
}

// Function to toggle group selection
window.toggleGroupSelection = function(event, path) {
    event.stopPropagation();

    // Find all categories under this path
    const pathPrefix = path + '>';
    const exactPath = path;

    const groupCategories = categories.filter(cat => {
        const name = cat.name || cat.canonical_id;
        return name === exactPath || name.startsWith(pathPrefix);
    });

    const allSelected = groupCategories.every(cat =>
        selectedCategories.has(cat.canonical_id)
    );

    groupCategories.forEach(category => {
        if (allSelected) {
            selectedCategories.delete(category.canonical_id);
        } else {
            selectedCategories.add(category.canonical_id);
        }
    });

    updateSearchButton();
    showNestedCategories();
};

// Function to toggle selection of all categories
window.toggleAllSelection = function(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    if (selectedCategories.size > 0) {
        // Deselect all if any are selected
        selectedCategories.clear();
    } else {
        // Select all if none are selected
        categories.forEach(cat => {
            selectedCategories.add(cat.canonical_id);
        });
    }

    updateSearchButton();
    showNestedCategories();
};

// Function to filter categories
function filterCategories(query) {
    filteredCategories = categories.filter(cat =>
        (cat.name || cat.canonical_id).toLowerCase().includes(query)
    ).slice(0, 50); // Limit to 50 results for performance

    displayFilteredCategories();
}

// Function to display filtered categories
function displayFilteredCategories() {
    const dropdownList = document.getElementById('category-dropdown-list');
    dropdownList.innerHTML = '';

    if (filteredCategories.length === 0) {
        dropdownList.innerHTML = '<div style="padding: 10px; color: #999;">結果が見つかりません</div>';
    } else {
        filteredCategories.forEach((category, index) => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';

            const name = category.name || category.canonical_id;
            const isSelected = selectedCategories.has(category.canonical_id);

            item.innerHTML = `
                <input type="checkbox" ${isSelected ? 'checked' : ''} />
                <span style="${isSelected ? 'font-weight: 500;' : ''}">${name}</span>
            `;

            item.onclick = (e) => {
                e.stopPropagation();
                selectCategory(category);
            };

            dropdownList.appendChild(item);
        });
    }

    showDropdown();
}

// Function to select a category
function selectCategory(category) {
    const categoryId = category.canonical_id;

    if (selectedCategories.has(categoryId)) {
        selectedCategories.delete(categoryId);
    } else {
        selectedCategories.add(categoryId);
    }

    updateSearchButton();

    // Re-render current view
    const searchInput = document.getElementById('category-search-input');
    if (searchInput.value) {
        filterCategories(searchInput.value.toLowerCase());
    } else {
        showNestedCategories();
    }
}

// Function to update chips display
function updateChipsDisplay() {
    const container = document.getElementById('chips-container');
    const placeholder = document.getElementById('chips-placeholder');

    if (!container) return;

    // Clear existing chips
    container.querySelectorAll('.category-chip').forEach(chip => chip.remove());

    if (selectedCategories.size === 0) {
        placeholder.style.display = 'block';
    } else {
        placeholder.style.display = 'none';

        let colorIndex = 0;
        selectedCategories.forEach(categoryId => {
            const category = categories.find(c => c.canonical_id === categoryId);
            if (category) {
                const chip = createChip(category, colorIndex % categoryColors.length);
                container.insertBefore(chip, placeholder);
                colorIndex++;
            }
        });
    }
}

// Function to create a chip element with color
function createChip(category, colorIndex) {
    const chip = document.createElement('div');
    chip.className = 'category-chip';
    chip.dataset.categoryId = category.canonical_id;
    chip.dataset.colorIndex = colorIndex;

    const color = categoryColors[colorIndex];
    chip.style.borderColor = color;
    chip.style.backgroundColor = color + '20'; // 20% opacity
    chip.style.color = color;

    const name = category.name || category.canonical_id;
    chip.innerHTML = `
        <span>${name}</span>
        <span class="remove-btn" onclick="removeCategory('${category.canonical_id}')">×</span>
    `;

    return chip;
}

// Function to show category modal
function showCategoryModal() {
    const overlay = document.getElementById('category-modal-overlay');
    overlay.style.display = 'block';

    // Initialize expanded state for top-level groups if not already set
    if (expandedPaths.size === 0) {
        const nestedStructure = buildNestedStructure(categories);
        Object.keys(nestedStructure.children).forEach(key => {
            expandedPaths.add(key);
        });
    }

    updateModalCategoryList();
    updateModalSelectionInfo();

    // Focus search input
    setTimeout(() => {
        document.getElementById('modal-category-search').focus();
    }, 100);
}

// Function to hide category modal
function hideCategoryModal() {
    const overlay = document.getElementById('category-modal-overlay');
    overlay.style.display = 'none';
}

// Function to update modal category list
function updateModalCategoryList(searchQuery = '') {
    const container = document.getElementById('modal-category-list');
    if (!container) return;

    container.innerHTML = '';

    // Add select all/none buttons
    const controls = document.createElement('div');
    controls.style.cssText = `
        padding: 10px;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
        display: flex;
        gap: 10px;
        position: sticky;
        top: 0;
        z-index: 10;
    `;

    // Single toggle button for select all/deselect all
    const selectToggleBtn = document.createElement('button');
    const hasSelection = selectedCategories.size > 0;
    selectToggleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            ${hasSelection ? '<polyline points="9 11 12 14 15 10"/>' : ''}
        </svg>
    `;
    selectToggleBtn.title = hasSelection ? 'すべて解除' : 'すべて選択';
    selectToggleBtn.style.cssText = `
        padding: 6px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        width: 32px;
        height: 32px;
        color: #333;
    `;
    selectToggleBtn.onmouseover = () => {
        selectToggleBtn.style.background = hasSelection ? '#fff0f0' : '#e8f0fe';
        selectToggleBtn.style.borderColor = hasSelection ? '#dc3545' : '#4285f4';
    };
    selectToggleBtn.onmouseout = () => {
        selectToggleBtn.style.background = 'white';
        selectToggleBtn.style.borderColor = '#ddd';
    };
    selectToggleBtn.onclick = () => {
        if (selectedCategories.size > 0) {
            // Deselect all
            selectedCategories.clear();
        } else {
            // Select all visible
            const visibleCategories = searchQuery ?
                categories.filter(c => (c.name || c.canonical_id).toLowerCase().includes(searchQuery.toLowerCase())) :
                categories;
            visibleCategories.forEach(c => selectedCategories.add(c.canonical_id));
        }
        updateModalCategoryList(searchQuery);
        updateChipsDisplay();
        updateModalSelectionInfo();
    };
    controls.appendChild(selectToggleBtn);

    // Add expand/collapse all button with SVG icon
    const hasExpandableGroups = Object.keys(buildNestedStructure(categories).children || {}).length > 0;
    if (hasExpandableGroups) {
        const expandBtn = document.createElement('button');
        const isExpanded = expandedPaths.size > 0;
        expandBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${isExpanded ?
                    '<path d="M6 9l6 6 6-6"/><path d="M6 15l6 6 6-6"/>' :  // Double chevron down (collapse all)
                    '<path d="M9 6l6 6-6 6"/><path d="M15 6l6 6-6 6"/>'    // Double chevron right (expand all)
                }
            </svg>
        `;
        expandBtn.title = isExpanded ? 'すべて折りたたむ' : 'すべて展開';
        expandBtn.style.cssText = `
            padding: 6px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            width: 32px;
            height: 32px;
            color: #333;
        `;
        expandBtn.onmouseover = () => {
            expandBtn.style.background = '#f0f0f0';
            expandBtn.style.borderColor = '#999';
        };
        expandBtn.onmouseout = () => {
            expandBtn.style.background = 'white';
            expandBtn.style.borderColor = '#ddd';
        };
        expandBtn.onclick = () => {
            if (expandedPaths.size > 0) {
                // Collapse all
                expandedPaths.clear();
            } else {
                // Expand all
                function findAllPaths(node, currentPath = '') {
                    const paths = [];
                    if (node.children && Object.keys(node.children).length > 0) {
                        for (const [childName, childNode] of Object.entries(node.children)) {
                            const childPath = currentPath ? `${currentPath}>${childName}` : childName;
                            paths.push(childPath);
                            paths.push(...findAllPaths(childNode, childPath));
                        }
                    }
                    return paths;
                }
                const allPaths = findAllPaths(buildNestedStructure(categories));
                expandedPaths = new Set(allPaths);
            }
            updateModalCategoryList(searchQuery);
        };
        controls.appendChild(expandBtn);
    }

    // Add selection count
    const selectionCount = document.createElement('span');
    selectionCount.style.cssText = `
        margin-left: auto;
        color: #666;
        font-size: 12px;
        padding: 6px;
    `;
    selectionCount.textContent = `${selectedCategories.size} / ${categories.length} 選択中`;
    controls.appendChild(selectionCount);

    container.appendChild(controls);

    // Build nested structure for modal
    const nestedStructure = buildNestedStructure(categories);

    // Filter if search query exists
    let itemsToShow = nestedStructure;
    if (searchQuery) {
        itemsToShow = filterNestedStructure(nestedStructure, searchQuery.toLowerCase());
    }

    // Display categories
    displayModalCategories(itemsToShow, container);
}

// Function to display categories in modal
function displayModalCategories(node, container, level = 0, parentPath = []) {
    // Display groups
    Object.keys(node.children).forEach(groupName => {
        const group = node.children[groupName];
        const currentPath = [...parentPath, groupName];
        const pathString = currentPath.join('>');
        const isExpanded = expandedPaths.has(pathString);
        const hasChildren = Object.keys(group.children).length > 0 || group.items.length > 0;

        // Create group header
        const groupDiv = document.createElement('div');
        groupDiv.style.cssText = `
            padding: 8px ${10 + level * 20}px;
            background: ${level === 0 ? '#f8f9fa' : '#ffffff'};
            border-bottom: 1px solid #e0e0e0;
            font-weight: 500;
            color: #333;
            cursor: ${hasChildren ? 'pointer' : 'default'};
            display: flex;
            align-items: center;
            transition: background 0.2s;
        `;

        if (hasChildren) {
            groupDiv.onmouseover = () => {
                groupDiv.style.background = '#f0f0f0';
            };
            groupDiv.onmouseout = () => {
                groupDiv.style.background = level === 0 ? '#f8f9fa' : '#ffffff';
            };
            groupDiv.onclick = () => {
                if (expandedPaths.has(pathString)) {
                    expandedPaths.delete(pathString);
                } else {
                    expandedPaths.add(pathString);
                }
                updateModalCategoryList(document.getElementById('modal-category-search').value);
            };
        }

        // Add arrow icon if has children
        if (hasChildren) {
            const arrow = document.createElement('span');
            arrow.style.cssText = `
                margin-right: 8px;
                font-size: 10px;
                transition: transform 0.2s;
                transform: ${isExpanded ? 'rotate(90deg)' : 'rotate(0)'};
            `;
            arrow.textContent = '▶';
            groupDiv.appendChild(arrow);
        } else {
            const spacer = document.createElement('span');
            spacer.style.width = '18px';
            groupDiv.appendChild(spacer);
        }

        const groupText = document.createElement('span');
        groupText.textContent = groupName;
        groupText.style.flex = '1';
        groupDiv.appendChild(groupText);

        // Add count badge
        const totalCount = group.count || (group.items.length + Object.keys(group.children).length);
        const selectedCount = group.items.filter(item => selectedCategories.has(item.canonical_id)).length;
        if (totalCount > 0) {
            const badge = document.createElement('span');
            badge.style.cssText = `
                background: #e0e0e0;
                color: #666;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                margin-left: 8px;
            `;
            badge.textContent = `${selectedCount}/${totalCount}`;
            groupDiv.appendChild(badge);
        }

        container.appendChild(groupDiv);

        // Create collapsible content container
        if (hasChildren && isExpanded) {
            // Display items in group
            group.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = `
                    padding: 8px ${10 + (level + 1) * 20}px;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    transition: background 0.2s;
                `;
                itemDiv.onmouseover = () => {
                    itemDiv.style.background = '#f8f9fa';
                };
                itemDiv.onmouseout = () => {
                    itemDiv.style.background = 'white';
                };

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = selectedCategories.has(item.canonical_id);
                checkbox.style.marginRight = '8px';
                checkbox.onchange = () => {
                    if (checkbox.checked) {
                        selectedCategories.add(item.canonical_id);
                    } else {
                        selectedCategories.delete(item.canonical_id);
                    }
                    updateChipsDisplay();
                    updateModalSelectionInfo();
                    // Update count in header
                    updateModalCategoryList(document.getElementById('modal-category-search').value);
                };

                const label = document.createElement('label');
                label.textContent = item.displayName;
                label.style.cssText = 'cursor: pointer; flex: 1; color: #333;';

                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
                itemDiv.onclick = (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.onchange();
                    }
                };

                container.appendChild(itemDiv);
            });

            // Recursively display children
            displayModalCategories(group, container, level + 1, currentPath);
        }
    });
}

// Function to filter nested structure
function filterNestedStructure(node, query) {
    const filtered = {
        name: node.name,
        children: {},
        items: node.items.filter(item =>
            item.fullPath.toLowerCase().includes(query)
        ),
        count: 0,
        selected: 0
    };

    // Recursively filter children
    Object.keys(node.children).forEach(key => {
        const childFiltered = filterNestedStructure(node.children[key], query);
        if (childFiltered.items.length > 0 || Object.keys(childFiltered.children).length > 0) {
            filtered.children[key] = childFiltered;
        }
    });

    return filtered;
}

// Function to update modal selection info
function updateModalSelectionInfo() {
    const info = document.getElementById('modal-selection-info');
    if (info) {
        info.textContent = `${selectedCategories.size}個選択中`;
    }
}

// Function to remove a category
window.removeCategory = function(categoryId) {
    selectedCategories.delete(categoryId);
    updateSearchButton();
    updateChipsDisplay();
    updateModalSelectionInfo();
};

// Function to clear all selections
function clearAllSelections() {
    if (selectedCategories.size > 0 && confirm(`${selectedCategories.size}個の選択をクリアしますか？`)) {
        selectedCategories.clear();
            updateSearchButton();
        clearMarkers();
        document.getElementById('results').innerHTML = '';

        // Update dropdown if visible
        if (dropdownVisible) {
            showNestedCategories();
        }
    }
}

// Function to update search button
function updateSearchButton() {
    const button = document.getElementById('search-button');
    if (!button) return; // Exit if button doesn't exist yet

    if (selectedCategories.size === 0) {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Function to show/hide dropdown
function showDropdown() {
    document.getElementById('category-dropdown-list').classList.add('visible');
    dropdownVisible = true;
}

function hideDropdown() {
    document.getElementById('category-dropdown-list').classList.remove('visible');
    dropdownVisible = false;
}

// Function to batch array into chunks
function batchArray(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
        batches.push(array.slice(i, i + batchSize));
    }
    return batches;
}

// Function to perform search with multiple categories with rate limiting
async function performSearch() {
    if (selectedCategories.size === 0) return;

    try {
        // Show loading state in results area
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                ">
                    <div style="
                        width: 64px;
                        height: 64px;
                        margin: 0 auto 16px;
                        background: #fff4e5;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 32px;
                        animation: pulse 1.5s ease-in-out infinite;
                    ">⏳</div>
                    <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                        検索中...
                    </div>
                    <div style="font-size: 12px; color: #999;">
                        しばらくお待ちください
                    </div>
                </div>
            `;
        }
        clearMarkers();

        // Update center marker position
        updateCenterMarker();

        const center = map.getCenter();
        const bounds = map.getBounds();

        // Convert selected categories to array
        const selectedCategoryIds = Array.from(selectedCategories);

        // Batch categories into groups of 90 (rate limit)
        const BATCH_SIZE = 90;
        const batches = batchArray(selectedCategoryIds, BATCH_SIZE);

        console.log(`Searching ${selectedCategoryIds.length} categories in ${batches.length} batch(es)`);

        const allResults = [];

        // Process each batch
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];

            // Update loading message for multi-batch searches
            if (batches.length > 1) {
                const resultsDiv = document.getElementById('results');
                if (resultsDiv) {
                    resultsDiv.innerHTML = `
                        <div style="
                            text-align: center;
                            padding: 40px 20px;
                            color: #666;
                        ">
                            <div style="
                                width: 64px;
                                height: 64px;
                                margin: 0 auto 16px;
                                background: #fff4e5;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 32px;
                                animation: pulse 1.5s ease-in-out infinite;
                            ">⏳</div>
                            <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                                検索中... (${batchIndex + 1}/${batches.length} バッチ)
                            </div>
                            <div style="font-size: 12px; color: #999;">
                                しばらくお待ちください
                            </div>
                        </div>
                    `;
                }
            }

            // Create promises for this batch
            const batchPromises = batch.map(async (categoryId, index) => {
                const globalIndex = batchIndex * BATCH_SIZE + index;
                // Get the actual index in selectedCategories to match chip colors
                const categoryColorIndex = selectedCategoryIds.indexOf(categoryId) % categoryColors.length;

                try {
                    const response = await fetch(
                        `https://api.mapbox.com/search/searchbox/v1/category/${encodeURIComponent(categoryId)}?` +
                        `proximity=${center.lng},${center.lat}&` +
                        `bbox=${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}&` +
                        'language=ja&' +
                        'limit=10&' + // Limit per category to avoid too many results
                        `access_token=${mapboxgl.accessToken}`
                    );

                    if (!response.ok) {
                        console.error(`Failed to search category ${categoryId}: ${response.status}`);
                        return {
                            categoryId,
                            categoryName: categoryId,
                            colorIndex: categoryColorIndex,
                            features: [],
                            error: `HTTP ${response.status}`
                        };
                    }

                    const data = await response.json();
                    const category = categories.find(c => c.canonical_id === categoryId);

                    return {
                        categoryId,
                        categoryName: category ? (category.name || category.canonical_id) : categoryId,
                        colorIndex: categoryColorIndex,
                        features: data.features || []
                    };
                } catch (error) {
                    console.error(`Error searching category ${categoryId}:`, error);
                    return {
                        categoryId,
                        categoryName: categoryId,
                        colorIndex: categoryColorIndex,
                        features: [],
                        error: error.message
                    };
                }
            });

            // Execute this batch in parallel
            const batchResults = await Promise.all(batchPromises);
            allResults.push(...batchResults);

            // If there are more batches, add a small delay to respect rate limits
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1 seconds between batches
            }
        }

        // Filter out failed requests and process results
        const successfulResults = allResults.filter(r => !r.error);
        const failedCount = allResults.filter(r => r.error).length;

        if (failedCount > 0) {
            console.warn(`${failedCount} category searches failed`);
        }

        // Process and combine results
        processMultiCategoryResults(successfulResults);

    } catch (error) {
        console.error('Error searching places:', error);
        // Keep status unchanged but show error in results
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px 20px;
                    color: #d32f2f;
                ">
                    <div style="
                        width: 64px;
                        height: 64px;
                        margin: 0 auto 16px;
                        background: #ffebee;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 32px;
                    ">⚠️</div>
                    <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                        検索エラーが発生しました
                    </div>
                    <div style="font-size: 12px; color: #999;">
                        もう一度お試しください
                    </div>
                </div>
            `;
        }
    }
}

// Function to process multi-category results
function processMultiCategoryResults(searchResults) {
    // Combine all results with category information
    const allResults = [];
    const resultsByCategory = {};

    searchResults.forEach(result => {
        resultsByCategory[result.categoryName] = result.features.length;

        result.features.forEach(feature => {
            // Add category metadata to each feature
            feature.categoryId = result.categoryId;
            feature.categoryName = result.categoryName;
            feature.colorIndex = result.colorIndex;
            allResults.push(feature);
        });
    });

    currentResults = allResults;

    // Display results
    displayMultiCategoryResults(allResults, resultsByCategory);
    addMultiCategoryMarkers(allResults);

    // Simply update the count in the status area without changing the message
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.textContent = `${selectedCategories.size}個のカテゴリーを選択中`;
        statusDiv.style.background = '#e8f0fe';
        statusDiv.style.color = '#1967d2';
    }
}

// Function to display multi-category results with modern UI/UX
function displayMultiCategoryResults(features, resultsByCategory) {
    const resultsDiv = document.getElementById('results');

    if (features.length === 0) {
        resultsDiv.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px 20px;
                color: #999;
            ">
                <div style="
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 16px;
                    background: #f0f0f0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                ">🔍</div>
                <div style="font-size: 14px; font-weight: 500; color: #666; margin-bottom: 4px;">
                    結果が見つかりませんでした
                </div>
                <div style="font-size: 12px; color: #999;">
                    別のエリアやカテゴリーをお試しください
                </div>
            </div>
        `;
        return;
    }

    // Clear existing content
    resultsDiv.innerHTML = '';

    // Create enhanced summary card with better visual hierarchy
    const summaryCard = document.createElement('div');
    summaryCard.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        color: white;
        animation: slideInDown 0.4s ease-out;
    `;

    // Summary header
    const summaryHeader = document.createElement('div');
    summaryHeader.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    `;
    summaryHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">📍</span>
            <span style="font-size: 15px; font-weight: 600;">検索結果</span>
        </div>
        <div style="
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            backdrop-filter: blur(10px);
        ">
            合計 ${features.length} 件
        </div>
    `;
    summaryCard.appendChild(summaryHeader);

    // Category breakdown with improved styling
    const categoryBreakdown = document.createElement('div');
    categoryBreakdown.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    `;

    Object.entries(resultsByCategory).forEach(([name, count]) => {
        const category = categories.find(c => c.name === name || c.canonical_id === name);
        const categoryId = category ? category.canonical_id : name;
        const colorIndex = Array.from(selectedCategories).indexOf(categoryId) % categoryColors.length;
        const color = categoryColors[colorIndex];

        const categoryPill = document.createElement('div');
        categoryPill.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.95);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
            color: #333;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        `;
        categoryPill.onmouseover = () => categoryPill.style.transform = 'translateY(-2px)';
        categoryPill.onmouseout = () => categoryPill.style.transform = 'translateY(0)';

        categoryPill.innerHTML = `
            <span style="
                display: inline-block;
                width: 10px;
                height: 10px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
            "></span>
            <span style="color: #555;">${name}</span>
            <span style="
                background: ${color}20;
                color: ${color};
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
            ">${count}</span>
        `;
        categoryBreakdown.appendChild(categoryPill);
    });

    summaryCard.appendChild(categoryBreakdown);
    resultsDiv.appendChild(summaryCard);

    // Group results by category for better organization
    const resultsByGroup = {};
    features.forEach((feature, index) => {
        const categoryName = feature.categoryName;
        if (!resultsByGroup[categoryName]) {
            resultsByGroup[categoryName] = [];
        }
        resultsByGroup[categoryName].push({ feature, index });
    });

    // Display results grouped by category
    Object.entries(resultsByGroup).forEach(([categoryName, items], groupIndex) => {
        // Category section header
        const category = categories.find(c => c.name === categoryName || c.canonical_id === categoryName);
        const categoryId = category ? category.canonical_id : categoryName;
        const colorIndex = Array.from(selectedCategories).indexOf(categoryId) % categoryColors.length;
        const color = categoryColors[colorIndex];

        const sectionHeader = document.createElement('div');
        sectionHeader.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 20px 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid ${color}30;
            animation: fadeIn 0.5s ease-out ${groupIndex * 0.1}s both;
        `;
        sectionHeader.innerHTML = `
            <div style="
                width: 32px;
                height: 32px;
                background: ${color}20;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            ">
                <div style="
                    width: 12px;
                    height: 12px;
                    background: ${color};
                    border-radius: 50%;
                "></div>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 600; color: #333;">${categoryName}</div>
                <div style="font-size: 11px; color: #999;">${items.length} 件の結果</div>
            </div>
        `;
        resultsDiv.appendChild(sectionHeader);

        // Display items in this category
        items.forEach(({ feature, index }, itemIndex) => {
            const properties = feature.properties || {};
            const coordinates = feature.geometry?.coordinates || [];

            const resultItem = document.createElement('div');
            resultItem.id = `result-item-${index}`; // Add unique ID for each result
            resultItem.style.cssText = `
                position: relative;
                padding: 14px;
                margin: 0 0 8px 0;
                background: white;
                border-radius: 10px;
                cursor: pointer;
                border: 1px solid ${color}20;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                animation: slideInRight 0.4s ease-out ${(groupIndex * 0.1) + (itemIndex * 0.05)}s both;
            `;

            // Add subtle left accent bar
            const accentBar = document.createElement('div');
            accentBar.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: linear-gradient(180deg, ${color} 0%, ${color}80 100%);
                transition: width 0.3s ease;
            `;
            resultItem.appendChild(accentBar);

            // Content container
            const contentContainer = document.createElement('div');
            contentContainer.style.cssText = `
                display: flex;
                align-items: flex-start;
                gap: 12px;
                position: relative;
            `;

            // Number badge with enhanced styling
            const numberBadge = document.createElement('div');
            numberBadge.style.cssText = `
                flex-shrink: 0;
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
                color: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                font-weight: 700;
                box-shadow: 0 2px 8px ${color}40;
                transition: transform 0.3s ease;
            `;
            numberBadge.textContent = index + 1;
            contentContainer.appendChild(numberBadge);

            // Info container
            const infoContainer = document.createElement('div');
            infoContainer.style.cssText = 'flex: 1; min-width: 0;';

            // Place name with icon
            const placeName = document.createElement('div');
            placeName.style.cssText = `
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 6px;
            `;
            placeName.innerHTML = `
                <span style="
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1a1a;
                    line-height: 1.4;
                ">${properties.name || properties.place_name || '名称なし'}</span>
            `;
            infoContainer.appendChild(placeName);

            // Category badge
            const categoryBadge = document.createElement('div');
            categoryBadge.style.cssText = `
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: ${color}15;
                color: ${color};
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
                border: 1px solid ${color}30;
            `;
            categoryBadge.innerHTML = `
                <span style="font-size: 10px;">●</span>
                <span>${feature.categoryName}</span>
            `;
            infoContainer.appendChild(categoryBadge);

            // Display all other properties
            const propertyDetails = document.createElement('div');
            propertyDetails.style.cssText = `
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid #f0f0f0;
                font-size: 11px;
                color: #888;
                line-height: 1.6;
            `;

            // Create a list of all properties excluding already displayed ones
            const excludeKeys = ['name', 'place_name'];
            const additionalProps = Object.entries(properties)
                .filter(([key]) => !excludeKeys.includes(key))
                .filter(([key, value]) => value !== null && value !== undefined && value !== '');

            if (additionalProps.length > 0) {
                const propsList = document.createElement('dl');
                propsList.style.cssText = `
                    margin: 0;
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 4px 8px;
                `;

                additionalProps.forEach(([key, value]) => {
                    const dt = document.createElement('dt');
                    dt.style.cssText = `
                        font-weight: 600;
                        color: #666;
                        text-transform: capitalize;
                    `;
                    dt.textContent = key.replace(/_/g, ' ') + ':';

                    const dd = document.createElement('dd');
                    dd.style.cssText = `
                        margin: 0;
                        word-break: break-word;
                        color: #888;
                    `;

                    // Handle different value types
                    if (typeof value === 'object') {
                        dd.textContent = JSON.stringify(value, null, 2);
                        dd.style.fontFamily = 'monospace';
                        dd.style.whiteSpace = 'pre-wrap';
                    } else if (typeof value === 'boolean') {
                        dd.textContent = value ? '✓' : '✗';
                    } else {
                        dd.textContent = String(value);
                    }

                    propsList.appendChild(dt);
                    propsList.appendChild(dd);
                });

                propertyDetails.appendChild(propsList);
                infoContainer.appendChild(propertyDetails);
            }

            contentContainer.appendChild(infoContainer);
            resultItem.appendChild(contentContainer);

            // Hover effects
            resultItem.onmouseover = () => {
                resultItem.style.background = `linear-gradient(to right, ${color}08 0%, white 100%)`;
                resultItem.style.boxShadow = `0 6px 16px ${color}20`;
                resultItem.style.transform = 'translateX(4px)';
                resultItem.style.borderColor = color;
                accentBar.style.width = '6px';
                numberBadge.style.transform = 'scale(1.1) rotate(5deg)';
            };

            resultItem.onmouseout = () => {
                resultItem.style.background = 'white';
                resultItem.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                resultItem.style.transform = 'translateX(0)';
                resultItem.style.borderColor = `${color}20`;
                accentBar.style.width = '4px';
                numberBadge.style.transform = 'scale(1) rotate(0deg)';
            };

            // Click handler
            resultItem.onclick = () => {
                if (coordinates.length === 2) {
                    // Visual feedback on click
                    resultItem.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        resultItem.style.transform = 'translateX(4px)';
                    }, 100);

                    map.flyTo({
                        center: coordinates,
                        zoom: 16,
                        duration: 1000,
                        essential: true
                    });

                    // Open popup for this marker
                    if (markers[index]) {
                        markers[index].togglePopup();
                    }
                }
            };

            resultsDiv.appendChild(resultItem);
        });
    });
}

// Function to add multi-category markers to map
function addMultiCategoryMarkers(features) {
    features.forEach((feature, index) => {
        const coordinates = feature.geometry?.coordinates;
        const properties = feature.properties || {};
        const color = categoryColors[feature.colorIndex];

        if (!coordinates || coordinates.length !== 2) return;

        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.style.cssText = `
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: ${color};
            border: 2px solid white;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s;
        `;
        markerElement.textContent = (index + 1).toString();

        // Add click handler to scroll to result in panel
        markerElement.addEventListener('click', () => {
            const resultItem = document.getElementById(`result-item-${index}`);
            if (resultItem) {
                // Scroll the result into view at the top
                resultItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Add highlight animation to the result
                resultItem.style.background = `linear-gradient(to right, ${color}20 0%, white 100%)`;
                resultItem.style.boxShadow = `0 6px 16px ${color}30`;
                resultItem.style.transform = 'scale(1.02)';

                // Remove highlight after animation
                setTimeout(() => {
                    resultItem.style.background = 'white';
                    resultItem.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                    resultItem.style.transform = 'scale(1)';
                }, 2000);
            }
        });

        // Create popup with only name and category
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <div style="padding: 5px;">
                    <strong>${properties.name || properties.place_name || '名称なし'}</strong>
                    <div style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-top: 4px;">
                        ${feature.categoryName}
                    </div>
                </div>
            `);

        // Create marker
        const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);

        markers.push(marker);
    });

    // Fit map to show all markers if there are results
    if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach(feature => {
            if (feature.geometry?.coordinates) {
                bounds.extend(feature.geometry.coordinates);
            }
        });

        map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 450, right: 50 },
            maxZoom: 15
        });
    }
}

// Function to clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

// Function to create status messages
function createStatusMessage(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;

    statusDiv.textContent = message;

    switch(type) {
        case 'error':
            statusDiv.style.background = '#fee';
            statusDiv.style.color = '#c00';
            break;
        case 'success':
            statusDiv.style.background = '#efe';
            statusDiv.style.color = '#060';
            break;
        case 'loading':
            statusDiv.style.background = '#fff4e5';
            statusDiv.style.color = '#f57c00';
            break;
        default:
            statusDiv.style.background = '#f5f5f5';
            statusDiv.style.color = '#666';
    }
}

// Initialize on map load
map.on('load', () => {
    initializeCategories();

    // Show center marker on load
    updateCenterMarker();

    // Update center marker when map moves
    map.on('moveend', () => {
        updateCenterMarker();
    });
});