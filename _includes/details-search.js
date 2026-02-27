// Current region (japan or global)
let currentRegion = 'japan';

// Static categories list - Complete list from Mapbox API (285 categories)
const JAPAN_CATEGORIES = [
  {"canonical_id": "ショップ", "icon": "shop", "name": "ショップ"},
  // {"canonical_id": "ショップ>おもちゃ", "icon": "shop", "name": "ショップ>おもちゃ"},
  // {"canonical_id": "ショップ>たばこ", "icon": "shop", "name": "ショップ>たばこ"},
  // {"canonical_id": "ショップ>アウトドア用品", "icon": "shop", "name": "ショップ>アウトドア用品"},
  // {"canonical_id": "ショップ>アウトレット", "icon": "shop", "name": "ショップ>アウトレット"},
  // {"canonical_id": "ショップ>カメラ", "icon": "shop", "name": "ショップ>カメラ"},
  // {"canonical_id": "ショップ>カー用品", "icon": "shop", "name": "ショップ>カー用品"},
  {"canonical_id": "ショップ>コンビニ", "icon": "convenience", "name": "ショップ>コンビニ"},
  // {"canonical_id": "ショップ>ゴルフ用品", "icon": "shop", "name": "ショップ>ゴルフ用品"},
  {"canonical_id": "ショップ>ショッピングセンター", "icon": "shop", "name": "ショップ>ショッピングセンター"},
  // {"canonical_id": "ショップ>ジュエリー", "icon": "shop", "name": "ショップ>ジュエリー"},
  // {"canonical_id": "ショップ>スキー用品", "icon": "shop", "name": "ショップ>スキー用品"},
  // {"canonical_id": "ショップ>スポーツ用品", "icon": "shop", "name": "ショップ>スポーツ用品"},
  // {"canonical_id": "ショップ>スーパー", "icon": "shop", "name": "ショップ>スーパー"},
  // {"canonical_id": "ショップ>チケット販売", "icon": "shop", "name": "ショップ>チケット販売"},
  // {"canonical_id": "ショップ>ディスカウントショップ", "icon": "shop", "name": "ショップ>ディスカウントショップ"},
  // {"canonical_id": "ショップ>ハンドバッグ", "icon": "shop", "name": "ショップ>ハンドバッグ"},
  // {"canonical_id": "ショップ>バイク販売", "icon": "shop", "name": "ショップ>バイク販売"},
  // {"canonical_id": "ショップ>ファッション(女性)", "icon": "clothing-store", "name": "ショップ>ファッション(女性)"},
  // {"canonical_id": "ショップ>ファッション(男性)", "icon": "clothing-store", "name": "ショップ>ファッション(男性)"},
  // {"canonical_id": "ショップ>ブライダル", "icon": "shop", "name": "ショップ>ブライダル"},
  // {"canonical_id": "ショップ>ベッド", "icon": "furniture", "name": "ショップ>ベッド"},
  // {"canonical_id": "ショップ>ベビー用品", "icon": "shop", "name": "ショップ>ベビー用品"},
  // {"canonical_id": "ショップ>ペット用品", "icon": "shop", "name": "ショップ>ペット用品"},
  // {"canonical_id": "ショップ>ホームセンター", "icon": "hardware", "name": "ショップ>ホームセンター"},
  // {"canonical_id": "ショップ>メガネ", "icon": "optician", "name": "ショップ>メガネ"},
  // {"canonical_id": "ショップ>リサイクル", "icon": "recycling", "name": "ショップ>リサイクル"},
  // {"canonical_id": "ショップ>中古車販売", "icon": "car", "name": "ショップ>中古車販売"},
  // {"canonical_id": "ショップ>健康食品", "icon": "grocery", "name": "ショップ>健康食品"},
  // {"canonical_id": "ショップ>八百屋", "icon": "grocery", "name": "ショップ>八百屋"},
  // {"canonical_id": "ショップ>化粧品", "icon": "shop", "name": "ショップ>化粧品"},
  // {"canonical_id": "ショップ>子ども服", "icon": "clothing-store", "name": "ショップ>子ども服"},
  // {"canonical_id": "ショップ>家具", "icon": "furniture", "name": "ショップ>家具"},
  // {"canonical_id": "ショップ>携帯電話", "icon": "mobile-phone", "name": "ショップ>携帯電話"},
  // {"canonical_id": "ショップ>文房具", "icon": "shop", "name": "ショップ>文房具"},
  // {"canonical_id": "ショップ>新車販売", "icon": "car", "name": "ショップ>新車販売"},
  // {"canonical_id": "ショップ>日用雑貨", "icon": "convenience", "name": "ショップ>日用雑貨"},
  // {"canonical_id": "ショップ>時計", "icon": "watch", "name": "ショップ>時計"},
  // {"canonical_id": "ショップ>書籍", "icon": "library", "name": "ショップ>書籍"},
  // {"canonical_id": "ショップ>百貨店", "icon": "commercial", "name": "ショップ>百貨店"},
  // {"canonical_id": "ショップ>米店", "icon": "grocery", "name": "ショップ>米店"},
  // {"canonical_id": "ショップ>肉屋", "icon": "slaughterhouse", "name": "ショップ>肉屋"},
  // {"canonical_id": "ショップ>自然食品", "icon": "grocery", "name": "ショップ>自然食品"},
  // {"canonical_id": "ショップ>自転車", "icon": "bicycle", "name": "ショップ>自転車"},
  // {"canonical_id": "ショップ>花屋", "icon": "florist", "name": "ショップ>花屋"},
  // {"canonical_id": "ショップ>薬局", "icon": "pharmacy", "name": "ショップ>薬局"},
  // {"canonical_id": "ショップ>質屋", "icon": "shop", "name": "ショップ>質屋"},
  // {"canonical_id": "ショップ>酒店", "icon": "alcohol-shop", "name": "ショップ>酒店"},
  // {"canonical_id": "ショップ>釣り用品", "icon": "shop", "name": "ショップ>釣り用品"},
  // {"canonical_id": "ショップ>電化製品", "icon": "shop", "name": "ショップ>電化製品"},
  // {"canonical_id": "ショップ>靴", "icon": "shoe", "name": "ショップ>靴"},
  // {"canonical_id": "ショップ>音楽", "icon": "music", "name": "ショップ>音楽"},
  // {"canonical_id": "ショップ>音楽楽器", "icon": "music", "name": "ショップ>音楽楽器"},
  // {"canonical_id": "ショップ>鮮魚店", "icon": "restaurant-seafood", "name": "ショップ>鮮魚店"},
  {"canonical_id": "トラベル", "icon": "suitcase", "name": "トラベル"},
  // {"canonical_id": "トラベル>ガソリンスタンド", "icon": "fuel", "name": "トラベル>ガソリンスタンド"},
  // {"canonical_id": "トラベル>サービスエリア", "icon": "highway-rest-area", "name": "トラベル>サービスエリア"},
  // {"canonical_id": "トラベル>タクシー", "icon": "taxi", "name": "トラベル>タクシー"},
  // {"canonical_id": "トラベル>チャージステーション", "icon": "charging-station", "name": "トラベル>チャージステーション"},
  {"canonical_id": "トラベル>バス", "icon": "bus", "name": "トラベル>バス"},
  // {"canonical_id": "トラベル>フェリー", "icon": "ferry", "name": "トラベル>フェリー"},
  // {"canonical_id": "トラベル>ホテル", "icon": "lodging", "name": "トラベル>ホテル"},
  {"canonical_id": "トラベル>レンタカー", "icon": "car-rental", "name": "トラベル>レンタカー"},
  // {"canonical_id": "トラベル>公共の宿", "icon": "lodging", "name": "トラベル>公共の宿"},
  // {"canonical_id": "トラベル>旅行代理店", "icon": "suitcase", "name": "トラベル>旅行代理店"},
  // {"canonical_id": "トラベル>旅館", "icon": "lodging", "name": "トラベル>旅館"},
  // {"canonical_id": "トラベル>民宿", "icon": "lodging", "name": "トラベル>民宿"},
  {"canonical_id": "トラベル>温泉", "icon": "hot-spring", "name": "トラベル>温泉"},
  // {"canonical_id": "トラベル>港", "icon": "harbor", "name": "トラベル>港"},
  // {"canonical_id": "トラベル>空港", "icon": "airport", "name": "トラベル>空港"},
  {"canonical_id": "トラベル>観光名所", "icon": "attraction", "name": "トラベル>観光名所"},
  {"canonical_id": "トラベル>観光案内", "icon": "information", "name": "トラベル>観光案内"},
  // {"canonical_id": "トラベル>鉄道", "icon": "rail", "name": "トラベル>鉄道"},
  // {"canonical_id": "トラベル>飛行機", "icon": "airport", "name": "トラベル>飛行機"},
  // {"canonical_id": "トラベル>駅", "icon": "rail-metro", "name": "トラベル>駅"},
  // {"canonical_id": "トラベル>駐車場", "icon": "parking", "name": "トラベル>駐車場"},
  {"canonical_id": "レジャー", "icon": "amusement-park", "name": "レジャー"},
  // {"canonical_id": "レジャー>お城", "icon": "castle", "name": "レジャー>お城"},
  // {"canonical_id": "レジャー>ウィンタースポーツ", "icon": "skiing", "name": "レジャー>ウィンタースポーツ"},
  // {"canonical_id": "レジャー>カジノ", "icon": "casino", "name": "レジャー>カジノ"},
  // {"canonical_id": "レジャー>カラオケボックス", "icon": "karaoke", "name": "レジャー>カラオケボックス"},
  // {"canonical_id": "レジャー>キャンプ場", "icon": "campsite", "name": "レジャー>キャンプ場"},
  // {"canonical_id": "レジャー>クルージング", "icon": "shop", "name": "レジャー>クルージング"},
  // {"canonical_id": "レジャー>ゲームセンター", "icon": "gaming", "name": "レジャー>ゲームセンター"},
  // {"canonical_id": "レジャー>ゴルフ", "icon": "golf", "name": "レジャー>ゴルフ"},
  // {"canonical_id": "レジャー>サッカー", "icon": "soccer", "name": "レジャー>サッカー"},
  // {"canonical_id": "レジャー>スケート", "icon": "stadium", "name": "レジャー>スケート"},
  // {"canonical_id": "レジャー>スポーツジム", "icon": "fitness-centre", "name": "レジャー>スポーツジム"},
  // {"canonical_id": "レジャー>スポーツ競技場", "icon": "stadium", "name": "レジャー>スポーツ競技場"},
  // {"canonical_id": "レジャー>セーリング", "icon": "ferry", "name": "レジャー>セーリング"},
  // {"canonical_id": "レジャー>テニス", "icon": "tennis", "name": "レジャー>テニス"},
  // {"canonical_id": "レジャー>テーマパーク", "icon": "amusement-park", "name": "レジャー>テーマパーク"},
  // {"canonical_id": "レジャー>ナイトクラブ", "icon": "nightclub", "name": "レジャー>ナイトクラブ"},
  // {"canonical_id": "レジャー>バスケットボール", "icon": "basketball", "name": "レジャー>バスケットボール"},
  // {"canonical_id": "レジャー>パチンコ", "icon": "gaming", "name": "レジャー>パチンコ"},
  // {"canonical_id": "レジャー>ビリヤード", "icon": "amusement-park", "name": "レジャー>ビリヤード"},
  // {"canonical_id": "レジャー>ボウリング", "icon": "bowling-alley", "name": "レジャー>ボウリング"},
  // {"canonical_id": "レジャー>ボクシング", "icon": "fitness-centre", "name": "レジャー>ボクシング"},
  // {"canonical_id": "レジャー>マリンスポーツ", "icon": "amusement-park", "name": "レジャー>マリンスポーツ"},
  // {"canonical_id": "レジャー>モーターレース", "icon": "amusement-park", "name": "レジャー>モーターレース"},
  // {"canonical_id": "レジャー>ヨガ", "icon": "fitness-centre", "name": "レジャー>ヨガ"},
  // {"canonical_id": "レジャー>公園", "icon": "park", "name": "レジャー>公園"},
  // {"canonical_id": "レジャー>劇場", "icon": "theatre", "name": "レジャー>劇場"},
  {"canonical_id": "レジャー>動物園", "icon": "zoo", "name": "レジャー>動物園"},
  // {"canonical_id": "レジャー>映画館", "icon": "cinema", "name": "レジャー>映画館"},
  {"canonical_id": "レジャー>植物園", "icon": "garden", "name": "レジャー>植物園"},
  {"canonical_id": "レジャー>水族館", "icon": "aquarium", "name": "レジャー>水族館"},
  // {"canonical_id": "レジャー>水泳場", "icon": "swimming", "name": "レジャー>水泳場"},
  {"canonical_id": "レジャー>牧場", "icon": "horse-riding", "name": "レジャー>牧場"},
  // {"canonical_id": "レジャー>競馬", "icon": "racetrack-horse", "name": "レジャー>競馬"},
  {"canonical_id": "レジャー>美術館", "icon": "art-gallery", "name": "レジャー>美術館"},
  {"canonical_id": "レジャー>自転車レンタル", "icon": "bicycle-share", "name": "レジャー>自転車レンタル"},
  // {"canonical_id": "レジャー>野球", "icon": "baseball", "name": "レジャー>野球"},
  // {"canonical_id": "レジャー>釣り", "icon": "water", "name": "レジャー>釣り"},
  // {"canonical_id": "レジャー>音楽ホール", "icon": "music", "name": "レジャー>音楽ホール"},
  // {"canonical_id": "レジャー博物館", "icon": "museum", "name": "レジャー博物館"},
  {"canonical_id": "レストラン", "icon": "restaurant", "name": "レストラン"},
  {"canonical_id": "レストラン>うどん", "icon": "restaurant-noodle", "name": "レストラン>うどん"},
  {"canonical_id": "レストラン>うなぎ", "icon": "restaurant-seafood", "name": "レストラン>うなぎ"},
  {"canonical_id": "レストラン>お好み焼き", "icon": "restaurant", "name": "レストラン>お好み焼き"},
  // {"canonical_id": "レストラン>かに", "icon": "restaurant-seafood", "name": "レストラン>かに"},
  // {"canonical_id": "レストラン>しゃぶしゃぶ", "icon": "restaurant", "name": "レストラン>しゃぶしゃぶ"},
  // {"canonical_id": "レストラン>すき焼き", "icon": "restaurant", "name": "レストラン>すき焼き"},
  // {"canonical_id": "レストラン>その他", "icon": "restaurant", "name": "レストラン>その他"},
  {"canonical_id": "レストラン>そば", "icon": "restaurant-noodle", "name": "レストラン>そば"},
  {"canonical_id": "レストラン>たこ焼き", "icon": "restaurant", "name": "レストラン>たこ焼き"},
  // {"canonical_id": "レストラン>ちゃんぽん", "icon": "restaurant", "name": "レストラン>ちゃんぽん"},
  // {"canonical_id": "レストラン>とんかつ", "icon": "restaurant", "name": "レストラン>とんかつ"},
  // {"canonical_id": "レストラン>アイスクリーム", "icon": "ice-cream", "name": "レストラン>アイスクリーム"},
  // {"canonical_id": "レストラン>アジアン料理", "icon": "restaurant", "name": "レストラン>アジアン料理"},
  // {"canonical_id": "レストラン>アフリカ料理", "icon": "restaurant", "name": "レストラン>アフリカ料理"},
  // {"canonical_id": "レストラン>アメリカン", "icon": "restaurant", "name": "レストラン>アメリカン"},
  // {"canonical_id": "レストラン>イタリアン", "icon": "restaurant", "name": "レストラン>イタリアン"},
  // {"canonical_id": "レストラン>インド料理", "icon": "restaurant", "name": "レストラン>インド料理"},
  {"canonical_id": "レストラン>カフェ", "icon": "cafe", "name": "レストラン>カフェ"},
  // {"canonical_id": "レストラン>カレー", "icon": "restaurant", "name": "レストラン>カレー"},
  // {"canonical_id": "レストラン>ケバブ", "icon": "restaurant", "name": "レストラン>ケバブ"},
  // {"canonical_id": "レストラン>サンドイッチ", "icon": "restaurant", "name": "レストラン>サンドイッチ"},
  // {"canonical_id": "レストラン>シーフード", "icon": "restaurant-seafood", "name": "レストラン>シーフード"},
  // {"canonical_id": "レストラン>ジャーマン", "icon": "restaurant", "name": "レストラン>ジャーマン"},
  // {"canonical_id": "レストラン>スイーツ", "icon": "confectionery", "name": "レストラン>スイーツ"},
  {"canonical_id": "レストラン>ステーキ", "icon": "restaurant", "name": "レストラン>ステーキ"},
  // {"canonical_id": "レストラン>スパニッシュ", "icon": "restaurant", "name": "レストラン>スパニッシュ"},
  // {"canonical_id": "レストラン>タイ料理", "icon": "restaurant", "name": "レストラン>タイ料理"},
  // {"canonical_id": "レストラン>タピオカ", "icon": "restaurant", "name": "レストラン>タピオカ"},
  // {"canonical_id": "レストラン>ドーナツ", "icon": "bakery", "name": "レストラン>ドーナツ"},
  // {"canonical_id": "レストラン>ハラル料理", "icon": "restaurant", "name": "レストラン>ハラル料理"},
  // {"canonical_id": "レストラン>ハンバーガー", "icon": "fast-food", "name": "レストラン>ハンバーガー"},
  // {"canonical_id": "レストラン>バー", "icon": "bar", "name": "レストラン>バー"},
  // {"canonical_id": "レストラン>パキスタン料理", "icon": "restaurant", "name": "レストラン>パキスタン料理"},
  // {"canonical_id": "レストラン>ビアガーデン", "icon": "beer", "name": "レストラン>ビアガーデン"},
  // {"canonical_id": "レストラン>ビュッフェ", "icon": "restaurant", "name": "レストラン>ビュッフェ"},
  // {"canonical_id": "レストラン>ビーガン料理", "icon": "restaurant", "name": "レストラン>ビーガン料理"},
  // {"canonical_id": "レストラン>ピザ", "icon": "restaurant-pizza", "name": "レストラン>ピザ"},
  // {"canonical_id": "レストラン>ファストフード", "icon": "fast-food", "name": "レストラン>ファストフード"},
  // {"canonical_id": "レストラン>ファミレス", "icon": "restaurant", "name": "レストラン>ファミレス"},
  // {"canonical_id": "レストラン>フレンチ", "icon": "restaurant", "name": "レストラン>フレンチ"},
  // {"canonical_id": "レストラン>フードコート", "icon": "restaurant", "name": "レストラン>フードコート"},
  // {"canonical_id": "レストラン>ブラジリアン", "icon": "restaurant", "name": "レストラン>ブラジリアン"},
  // {"canonical_id": "レストラン>ベジタリアン", "icon": "restaurant", "name": "レストラン>ベジタリアン"},
  // {"canonical_id": "レストラン>ベトナム料理", "icon": "restaurant", "name": "レストラン>ベトナム料理"},
  // {"canonical_id": "レストラン>ベーカリー", "icon": "bakery", "name": "レストラン>ベーカリー"},
  // {"canonical_id": "レストラン>ホットドッグ", "icon": "fast-food", "name": "レストラン>ホットドッグ"},
  // {"canonical_id": "レストラン>メキシカン", "icon": "restaurant", "name": "レストラン>メキシカン"},
  // {"canonical_id": "レストラン>ラーメン", "icon": "restaurant-noodle", "name": "レストラン>ラーメン"},
  // {"canonical_id": "レストラン>ロシアン", "icon": "restaurant", "name": "レストラン>ロシアン"},
  // {"canonical_id": "レストラン>ワインバー", "icon": "bar", "name": "レストラン>ワインバー"},
  // {"canonical_id": "レストラン>中華料理", "icon": "restaurant", "name": "レストラン>中華料理"},
  // {"canonical_id": "レストラン>丼もの", "icon": "restaurant", "name": "レストラン>丼もの"},
  // {"canonical_id": "レストラン>和菓子", "icon": "confectionery", "name": "レストラン>和菓子"},
  // {"canonical_id": "レストラン>和食", "icon": "restaurant", "name": "レストラン>和食"},
  // {"canonical_id": "レストラン>喫茶店（その他）", "icon": "cafe", "name": "レストラン>喫茶店（その他）"},
  // {"canonical_id": "レストラン>地中海", "icon": "restaurant", "name": "レストラン>地中海"},
  {"canonical_id": "レストラン>天ぷら", "icon": "restaurant", "name": "レストラン>天ぷら"},
  {"canonical_id": "レストラン>寿司", "icon": "restaurant-sushi", "name": "レストラン>寿司"},
  {"canonical_id": "レストラン>居酒屋", "icon": "bar", "name": "レストラン>居酒屋"},
  // {"canonical_id": "レストラン>弁当", "icon": "restaurant", "name": "レストラン>弁当"},
  // {"canonical_id": "レストラン>洋食", "icon": "restaurant", "name": "レストラン>洋食"},
  {"canonical_id": "レストラン>焼き鳥", "icon": "restaurant", "name": "レストラン>焼き鳥"},
  // {"canonical_id": "レストラン>焼肉", "icon": "restaurant", "name": "レストラン>焼肉"},
  // {"canonical_id": "レストラン>西洋", "icon": "restaurant", "name": "レストラン>西洋"},
  // {"canonical_id": "レストラン>鍋料理", "icon": "restaurant", "name": "レストラン>鍋料理"},
  // {"canonical_id": "レストラン>韓国料理", "icon": "restaurant", "name": "レストラン>韓国料理"},
  // {"canonical_id": "レストラン>餃子", "icon": "restaurant", "name": "レストラン>餃子"},
  /*{"canonical_id": "医療", "icon": "hospital", "name": "医療"},
  {"canonical_id": "医療>はり", "icon": "hospital-JP", "name": "医療>はり"},
  {"canonical_id": "医療>アレルギー科", "icon": "doctor", "name": "医療>アレルギー科"},
  {"canonical_id": "医療>マッサージ", "icon": "doctor", "name": "医療>マッサージ"},
  {"canonical_id": "医療>リハビリテーション科", "icon": "doctor", "name": "医療>リハビリテーション科"},
  {"canonical_id": "医療>内科", "icon": "doctor", "name": "医療>内科"},
  {"canonical_id": "医療>外科", "icon": "doctor", "name": "医療>外科"},
  {"canonical_id": "医療>婦人科", "icon": "hospital-JP", "name": "医療>婦人科"},
  {"canonical_id": "医療>小児科", "icon": "hospital-JP", "name": "医療>小児科"},
  {"canonical_id": "医療>整体", "icon": "doctor", "name": "医療>整体"},
  {"canonical_id": "医療>整形外科", "icon": "doctor", "name": "医療>整形外科"},
  {"canonical_id": "医療>歯科", "icon": "dentist", "name": "医療>歯科"},
  {"canonical_id": "医療>産婦人科", "icon": "hospital-JP", "name": "医療>産婦人科"},
  {"canonical_id": "医療>病院", "icon": "hospital", "name": "医療>病院"},
  {"canonical_id": "医療>皮膚科", "icon": "hospital-JP", "name": "医療>皮膚科"},
  {"canonical_id": "医療>眼科", "icon": "hospital-JP", "name": "医療>眼科"},
  {"canonical_id": "医療>精神科", "icon": "hospital-JP", "name": "医療>精神科"},
  {"canonical_id": "医療>美容外科", "icon": "doctor", "name": "医療>美容外科"},
  {"canonical_id": "医療>耳鼻咽喉科", "icon": "hospital-JP", "name": "医療>耳鼻咽喉科"},
  {"canonical_id": "医療>薬局", "icon": "pharmacy", "name": "医療>薬局"},
  {"canonical_id": "生活", "icon": "shop", "name": "生活"},
  {"canonical_id": "生活>そろばん教室", "icon": "school", "name": "生活>そろばん教室"},
  {"canonical_id": "生活>アート教室", "icon": "school", "name": "生活>アート教室"},
  {"canonical_id": "生活>コインランドリー", "icon": "laundry", "name": "生活>コインランドリー"},
  {"canonical_id": "生活>コンサルタント", "icon": "building-alt1", "name": "生活>コンサルタント"},
  {"canonical_id": "生活>サウナ", "icon": "hot-spring", "name": "生活>サウナ"},
  {"canonical_id": "生活>タトゥー", "icon": "shop", "name": "生活>タトゥー"},
  {"canonical_id": "生活>ダンス教室", "icon": "school", "name": "生活>ダンス教室"},
  {"canonical_id": "生活>ドライクリーニング", "icon": "laundry", "name": "生活>ドライクリーニング"},
  {"canonical_id": "生活>ネイルサロン", "icon": "shop", "name": "生活>ネイルサロン"},
  {"canonical_id": "生活>ハウスクリーニング", "icon": "shop", "name": "生活>ハウスクリーニング"},
  {"canonical_id": "生活>バイク修理", "icon": "car-repair", "name": "生活>バイク修理"},
  {"canonical_id": "生活>バレエ教室", "icon": "school", "name": "生活>バレエ教室"},
  {"canonical_id": "生活>パソコン教室", "icon": "school", "name": "生活>パソコン教室"},
  {"canonical_id": "生活>ビジネススクール", "icon": "school", "name": "生活>ビジネススクール"},
  {"canonical_id": "生活>ビデオレンタル", "icon": "cinema", "name": "生活>ビデオレンタル"},
  {"canonical_id": "生活>ピアスショップ", "icon": "shop", "name": "生活>ピアスショップ"},
  {"canonical_id": "生活>ピアノ教室", "icon": "school", "name": "生活>ピアノ教室"},
  {"canonical_id": "生活>モスク", "icon": "religious-muslim", "name": "生活>モスク"},
  {"canonical_id": "生活>レッカー", "icon": "car", "name": "生活>レッカー"},
  {"canonical_id": "生活>レンタルショップ", "icon": "shop", "name": "生活>レンタルショップ"},
  {"canonical_id": "生活>不動産", "icon": "home", "name": "生活>不動産"},
  {"canonical_id": "生活>中学校", "icon": "school", "name": "生活>中学校"},
  {"canonical_id": "生活>人材派遣", "icon": "shop", "name": "生活>人材派遣"},
  {"canonical_id": "生活>会計士", "icon": "shop", "name": "生活>会計士"},
  {"canonical_id": "生活>保育園", "icon": "shop", "name": "生活>保育園"},
  {"canonical_id": "生活>保育所", "icon": "shop", "name": "生活>保育所"},
  {"canonical_id": "生活>保険業", "icon": "bank", "name": "生活>保険業"},
  {"canonical_id": "生活>倉庫", "icon": "warehouse", "name": "生活>倉庫"},
  {"canonical_id": "生活>児童施設", "icon": "shop", "name": "生活>児童施設"},
  {"canonical_id": "生活>公証人", "icon": "town-hall", "name": "生活>公証人"},
  {"canonical_id": "生活>動物病院", "icon": "shop", "name": "生活>動物病院"},
  {"canonical_id": "生活>占い", "icon": "shop", "name": "生活>占い"},
  {"canonical_id": "生活>図書館", "icon": "library", "name": "生活>図書館"},
  {"canonical_id": "生活>国の機関", "icon": "town-hall", "name": "生活>国の機関"},
  {"canonical_id": "生活>大使館", "icon": "embassy", "name": "生活>大使館"},
  {"canonical_id": "生活>大学", "icon": "college-JP", "name": "生活>大学"},
  {"canonical_id": "生活>学校(その他)", "icon": "school", "name": "生活>学校(その他)"},
  {"canonical_id": "生活>学習塾", "icon": "school", "name": "生活>学習塾"},
  {"canonical_id": "生活>宅配便", "icon": "shop", "name": "生活>宅配便"},
  {"canonical_id": "生活>宗教(その他)", "icon": "shop", "name": "生活>宗教(その他)"},
  {"canonical_id": "生活>害虫駆除", "icon": "shop", "name": "生活>害虫駆除"},
  {"canonical_id": "生活>寺院", "icon": "religious-buddhist", "name": "生活>寺院"},
  {"canonical_id": "生活>専門学校", "icon": "school", "name": "生活>専門学校"},
  {"canonical_id": "生活>小学校", "icon": "school", "name": "生活>小学校"},
  {"canonical_id": "生活>幼稚園", "icon": "school", "name": "生活>幼稚園"},
  {"canonical_id": "生活>弁護士", "icon": "shop", "name": "生活>弁護士"},
  {"canonical_id": "生活>教会", "icon": "religious-christian", "name": "生活>教会"},
  {"canonical_id": "生活>料理教室", "icon": "school", "name": "生活>料理教室"},
  {"canonical_id": "生活>日焼けサロン", "icon": "hairdresser", "name": "生活>日焼けサロン"},
  {"canonical_id": "生活>水泳教室", "icon": "swimming", "name": "生活>水泳教室"},
  {"canonical_id": "生活>洗車場", "icon": "car", "name": "生活>洗車場"},
  {"canonical_id": "生活>消防機関", "icon": "fire-station", "name": "生活>消防機関"},
  {"canonical_id": "生活>温泉浴場", "icon": "hot-spring", "name": "生活>温泉浴場"},
  {"canonical_id": "生活>着付け", "icon": "clothing-store", "name": "生活>着付け"},
  {"canonical_id": "生活>短期大学", "icon": "college-JP", "name": "生活>短期大学"},
  {"canonical_id": "生活>神社", "icon": "religious-shinto", "name": "生活>神社"},
  {"canonical_id": "生活>福祉施設", "icon": "shop", "name": "生活>福祉施設"},
  {"canonical_id": "生活>税理士", "icon": "shop", "name": "生活>税理士"},
  {"canonical_id": "生活>美容(その他)", "icon": "shop", "name": "生活>美容(その他)"},
  {"canonical_id": "生活>美容院", "icon": "hairdresser", "name": "生活>美容院"},
  {"canonical_id": "生活>翻訳", "icon": "shop", "name": "生活>翻訳"},
  {"canonical_id": "生活>老人施設", "icon": "shop", "name": "生活>老人施設"},
  {"canonical_id": "生活>自動車修理", "icon": "car-repair", "name": "生活>自動車修理"},
  {"canonical_id": "生活>自動車教習所", "icon": "school", "name": "生活>自動車教習所"},
  {"canonical_id": "生活>葬祭業", "icon": "cemetery", "name": "生活>葬祭業"},
  {"canonical_id": "生活>裁判所", "icon": "town-hall", "name": "生活>裁判所"},
  {"canonical_id": "生活>語学学校", "icon": "school", "name": "生活>語学学校"},
  {"canonical_id": "生活>警察機関", "icon": "police", "name": "生活>警察機関"},
  {"canonical_id": "生活>貸衣装", "icon": "shop", "name": "生活>貸衣装"},
  {"canonical_id": "生活>運送", "icon": "suitcase", "name": "生活>運送"},
  {"canonical_id": "生活>郵便局", "icon": "post", "name": "生活>郵便局"},
  {"canonical_id": "生活>金融(その他)", "icon": "shop", "name": "生活>金融(その他)"},
  {"canonical_id": "生活>銀行", "icon": "bank", "name": "生活>銀行"},
  {"canonical_id": "生活>銭湯", "icon": "hot-spring", "name": "生活>銭湯"},
  {"canonical_id": "生活>鍵", "icon": "hardware", "name": "生活>鍵"},
  {"canonical_id": "生活>防犯", "icon": "shop", "name": "生活>防犯"},
  {"canonical_id": "生活>霊園", "icon": "cemetery", "name": "生活>霊園"},
  {"canonical_id": "生活>靴修理", "icon": "shoe", "name": "生活>靴修理"},
  {"canonical_id": "生活>音楽教室", "icon": "music", "name": "生活>音楽教室"},
  {"canonical_id": "生活>高等学校", "icon": "school", "name": "生活>高等学校"}*/
];

// Global categories will be loaded from global-categories.js
// Initialize as empty, will be populated from the included script

// Get current categories based on region
function getCurrentCategories() {
  return currentRegion === 'japan' ? JAPAN_CATEGORIES : (window.GLOBAL_CATEGORIES || []);
}

// Global variables
let map;
let currentCategory = null;
let currentPath = [];
let markers = [];
let sessionToken = null;
let selectedPOI = null;

// Update map language
function updateMapLanguage(language) {
  if (!map) return;

  try {
    map.setLanguage(language);
    console.log('Map language updated to:', language);
  } catch (e) {
    console.error('Error updating map language:', e);
  }
}

// Initialize map
function initMap() {
  map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/mapbox/streets-v8',
    style: 'mapbox://styles/kenji-shima/cmm46lgte005e01suc9nx7yir',
    center: [139.7671, 35.6812], // Tokyo (default for Japan)
    zoom: 11,
    language: 'ja'
  });

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // Add language plugin
  mapboxgl.setRTLTextPlugin(
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js'
  );

  map.on('load', () => {
    // Map is ready
    console.log('Map loaded');

    // Load custom location pin image
    map.loadImage('./assets/images/location-pin.png', (error, image) => {
      if (error) {
        console.error('Error loading location pin:', error);
        return;
      }
      map.addImage('location-pin', image);
      console.log('Custom location pin loaded');
    });

    // Set initial language to Japanese (since we start with Japan region)
    updateMapLanguage('ja');

    /*// Hide all POI-related layers from the base style
    const layers = map.getStyle().layers;
    console.log('Hiding POI layers from base style...');

    layers.forEach(layer => {
      // Hide layers that are POI-related
      // Common POI layer patterns in Mapbox styles include:
      // - layers with 'poi' in the id
      // - layers with 'label' that aren't road labels
      // - layers with specific source-layers like 'poi_label'

      if (layer.id.includes('poi')) {

        // Hide the layer by setting its visibility to 'none'
        map.setLayoutProperty(layer.id, 'visibility', 'none');
        console.log(`Hidden layer: ${layer.id}`);
      }
    });*/

    // Add source for POIs
    map.addSource('pois', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': []
      }
    });

    // OPTION 1: Custom location pin image (commented out)
    /*
    map.addLayer({
      'id': 'poi-icons',
      'type': 'symbol',
      'source': 'pois',
      'layout': {
        'icon-image': 'location-pin', // Use the custom location pin image
        'icon-size': [
          'case',
          ['get', 'selected'],
          0.06,  // Selected size - larger for emphasis
          0.036  // Default size (3.6% of original)
        ],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-anchor': 'bottom'  // Anchor at bottom for pin-style markers
      },
      'paint': {
        'icon-opacity': 1
      }
    });
    */

    // OPTION 2: Circle markers - Base layer for all POIs
    map.addLayer({
      'id': 'poi-markers',
      'type': 'circle',
      'source': 'pois',
      'paint': {
        'circle-radius': 6,  // Consistent size for all POIs
        'circle-color': '#ee4e8b',  // Pink/red color for all POIs
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Add a separate highlight layer for selected POI
    map.addLayer({
      'id': 'poi-selected',
      'type': 'circle',
      'source': 'pois',
      'filter': ['==', ['get', 'selected'], true],  // Only show selected POIs
      'paint': {
        'circle-radius': 12,  // Much larger for emphasis
        'circle-color': '#FFD700',  // Gold/yellow color for high contrast
        'circle-stroke-width': 4,
        'circle-stroke-color': '#FF4500',  // Orange-red stroke
        'circle-opacity': 0.9,
        'circle-stroke-opacity': 1
      }
    });

    // Add labels layer for POI names
    map.addLayer({
      'id': 'poi-labels',
      'type': 'symbol',
      'source': 'pois',
      'layout': {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 0.8],  // Offset below the pin
        'text-anchor': 'top',  // Anchor at top so text appears below icon
        'text-size': [
          'case',
          ['get', 'selected'],
          14,  // Larger text when selected
          10   // Default text size
        ],
        'text-optional': true
      },
      'paint': {
        'text-color': [
          'case',
          ['get', 'selected'],
          '#FF4500', // Orange-red text color for selected
          '#333'     // Default text color
        ],
        'text-halo-color': [
          'case',
          ['get', 'selected'],
          '#FFD700',  // Gold halo for selected text
          '#fff'      // White halo for default text
        ],
        'text-halo-width': [
          'case',
          ['get', 'selected'],
          3,  // Thicker halo when selected
          2   // Default halo width
        ]
      }
    });

    // Add hover effect for icons
    // Update to use poi-markers instead of poi-icons
    map.on('mouseenter', 'poi-markers', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'poi-markers', () => {
      map.getCanvas().style.cursor = '';
    });

    // Add click handler for POI markers
    map.on('click', 'poi-markers', (e) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        const poiData = feature.properties.poiData ? JSON.parse(feature.properties.poiData) : null;
        if (poiData) {
          selectPOI(poiData, feature.properties.index);
        }
      }
    });
  });
}

// Generate UUID for session token
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Build hierarchical category structure
function buildCategoryHierarchy() {
  const hierarchy = {};
  const categories = getCurrentCategories();

  categories.forEach(cat => {
    const parts = cat.canonical_id.split('>');

    if (parts.length === 1) {
      // Top-level category
      if (!hierarchy[parts[0]]) {
        hierarchy[parts[0]] = {
          ...cat,
          children: []
        };
      }
    } else if (parts.length === 2) {
      // Subcategory
      const parent = parts[0];
      if (!hierarchy[parent]) {
        hierarchy[parent] = {
          canonical_id: parent,
          name: parent,
          icon: 'shop',
          children: []
        };
      }
      hierarchy[parent].children.push(cat);
    }
  });

  return hierarchy;
}

// Get icon for category
function getCategoryIcon(iconName) {
  const iconMap = {
    'shop': '🏪',
    'restaurant': '🍽️',
    'suitcase': '✈️',
    'hospital': '🏥',
    'hairdresser': '💇',
    'bar': '🍺',
    'amusement-park': '🎢',
    'home': '🏠',
    'cafe': '☕',
    'town-hall': '🏛️',
    'attraction': '📸',
    'fast-food': '🍔',
    'school': '🎓',
    'parking': '🅿️',
    'convenience': '🏪',
    'park': '🌳',
    'bus': '🚌',
    'car-repair': '🔧',
    'pharmacy': '💊',
    'lodging': '🏨',
    'car': '🚗',
    'religious-buddhist': '⛩️',
    'fuel': '⛽',
    'furniture': '🪑',
    'dentist': '🦷',
    'bank': '🏦',
    'hospital-JP': '🏥',
    'restaurant-sushi': '🍣',
    'post': '📮',
    'building-alt1': '🏢',
    'restaurant-pizza': '🍕',
    'cemetery': '⚰️',
    'doctor': '👨‍⚕️',
    'confectionery': '🍰',
    'restaurant-noodle': '🍜',
    'florist': '💐',
    'fitness-centre': '💪',
    'bakery': '🥐',
    'laundry': '👔',
    'karaoke': '🎤',
    'library': '📚',
    'art-gallery': '🎨',
    'museum': '🏛️',
    'horse-riding': '🐴',
    'charging-station': '🔌',
    'suitcase': '💼',
    'stadium': '🏟️',
    'shoe': '👟',
    'warehouse': '🏭',
    'mobile-phone': '📱',
    'car-rental': '🚙',
    'alcohol-shop': '🍾',
    'fire-station': '🚒',
    'golf': '⛳',
    'police': '👮',
    'religious-christian': '⛪',
    'bicycle': '🚲',
    'rail': '🚆',
    'rail-metro': '🚉',
    'casino': '🎰',
    'music': '🎵',
    'college-JP': '🎓',
    'slaughterhouse': '🥩',
    'hardware': '🔨',
    'ice-cream': '🍦',
    'nightclub': '🕺',
    'tennis': '🎾',
    'baseball': '⚾',
    'clothing-store': '👕',
    'religious-shinto': '⛩️',
    'hot-spring': '♨️',
    'taxi': '🚕',
    'highway-rest-area': '🛣️',
    'optician': '👓',
    'campsite': '🏕️',
    'information': '📍',
    'swimming': '🏊',
    'recycling': '♻️',
    'theatre': '🎭',
    'cinema': '🎬',
    'skiing': '⛷️',
    'gaming': '🎮'
  };

  return iconMap[iconName] || '📍';
}

// Display categories in the list
function displayCategories(categories, isSubcategory = false) {
  const categoryList = document.getElementById('categoryList');
  categoryList.innerHTML = '';

  if (categories.length === 0) {
    categoryList.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">📭</div>
        <div class="no-results-text">${currentRegion === 'japan' ? 'カテゴリーがありません' : 'No categories available'}</div>
      </div>
    `;
    return;
  }

  categories.forEach((cat, index) => {
    const tile = document.createElement('div');
    tile.className = 'category-tile';
    tile.tabIndex = index;

    const hasChildren = cat.children && cat.children.length > 0;
    const icon = getCategoryIcon(cat.icon);

    tile.innerHTML = `
      <div class="category-icon">${icon}</div>
      <div class="category-content">
        <div class="category-name">${cat.name}</div>
        ${hasChildren ? `<div class="category-count">${cat.children.length} ${currentRegion === 'japan' ? 'サブカテゴリー' : 'subcategories'}</div>` : ''}
      </div>
      ${hasChildren ? '<div class="category-arrow">▶</div>' : ''}
    `;

    tile.onclick = () => selectCategory(cat, hasChildren);

    // Add keyboard navigation
    tile.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCategory(cat, hasChildren);
      }
    };

    categoryList.appendChild(tile);
  });

  // Focus first item for TV navigation
  if (categories.length > 0) {
    categoryList.children[0].focus();
  }
}

// Select a category
function selectCategory(category, hasChildren) {
  // Check if this is a main category (no > in the canonical_id)
  const isMainCategory = !category.canonical_id.includes('>');

  if (isMainCategory && hasChildren) {
    // For main categories with subcategories, perform search for all POIs in this category
    currentCategory = category;
    // Create a combined category that includes all subcategories
    const combinedCategory = {
      ...category,
      canonical_id: category.canonical_id,
      name: category.name,
      icon: category.icon,
      // Include all subcategory IDs for search
      allCategoryIds: getAllSubcategoryIds(category)
    };
    performCategorySearch(combinedCategory);
  } else if (hasChildren) {
    // For non-main categories with children, show subcategories as before
    currentPath.push(category);
    displaySubcategories(category);
  } else {
    // Final category selected - perform search
    currentCategory = category;
    performCategorySearch(category);
  }
}

// Helper function to get all subcategory IDs from a parent category
function getAllSubcategoryIds(parentCategory) {
  const ids = [parentCategory.canonical_id];

  if (parentCategory.children && parentCategory.children.length > 0) {
    parentCategory.children.forEach(child => {
      ids.push(child.canonical_id);
      // Recursively get IDs from nested children
      if (child.children && child.children.length > 0) {
        ids.push(...getAllSubcategoryIds(child));
      }
    });
  }

  return ids;
}

// Display subcategories
function displaySubcategories(parentCategory) {
  const categoryList = document.getElementById('categoryList');

  // Update breadcrumb
  updateBreadcrumb();

  // Display children
  displayCategories(parentCategory.children, true);

  // Update status
  document.getElementById('statusText').textContent = currentRegion === 'japan' ?
    `${parentCategory.name} のサブカテゴリー` :
    `${parentCategory.name} subcategories`;
}

// Update breadcrumb navigation
function updateBreadcrumb() {
  const breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.innerHTML = '';

  // Add home
  const homeItem = document.createElement('span');
  homeItem.className = 'breadcrumb-item';
  homeItem.innerHTML = `<a href="#" class="breadcrumb-link" onclick="navigateToHome()">${currentRegion === 'japan' ? 'カテゴリー' : 'Categories'}</a>`;
  breadcrumb.appendChild(homeItem);

  // Add path items
  currentPath.forEach((cat, index) => {
    const separator = document.createElement('span');
    separator.className = 'breadcrumb-separator';
    separator.textContent = ' > ';
    breadcrumb.appendChild(separator);

    const item = document.createElement('span');
    item.className = 'breadcrumb-item';

    if (index === currentPath.length - 1) {
      // Current level
      item.textContent = cat.name;
    } else {
      // Clickable parent
      item.innerHTML = `<a href="#" class="breadcrumb-link" onclick="navigateToLevel(${index})">${cat.name}</a>`;
    }

    breadcrumb.appendChild(item);
  });
}

// Navigate to home
function navigateToHome() {
  currentPath = [];
  const hierarchy = buildCategoryHierarchy();
  displayCategories(Object.values(hierarchy));
  updateBreadcrumb();
  document.getElementById('statusText').textContent = currentRegion === 'japan' ? 'カテゴリーを選択してください' : 'Select a category';
}

// Navigate to specific level
function navigateToLevel(level) {
  currentPath = currentPath.slice(0, level + 1);
  const category = currentPath[currentPath.length - 1];
  displaySubcategories(category);
}

// Perform category search using SearchBox API
async function performCategorySearch(category) {
  const categoryList = document.getElementById('categoryList');
  const statusText = document.getElementById('statusText');
  const statusCount = document.getElementById('statusCount');

  // Show loading state
  categoryList.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">${currentRegion === 'japan' ? 'POIを検索中...' : 'Searching for places...'}</div>
      <div class="loading-progress">
        <div class="loading-progress-bar" id="progressBar"></div>
      </div>
    </div>
  `;

  statusText.textContent = currentRegion === 'japan' ?
    `${category.name} を検索中...` :
    `Searching ${category.name}...`;
  statusCount.textContent = '';

  // Clear existing markers
  clearMarkers();

  // Generate session token for this search session
  sessionToken = generateUUID();

  try {
    // Get current map center for proximity
    const center = map.getCenter();

    // Check if we need to search multiple categories (for main categories)
    const categoriesToSearch = category.allCategoryIds || [category.canonical_id];

    // Collect all search results
    const allSearchResults = [];

    // Update loading text to show we're searching multiple categories
    if (categoriesToSearch.length > 1) {
      const loadingContainer = categoryList.querySelector('.loading-text');
      if (loadingContainer) {
        loadingContainer.textContent = currentRegion === 'japan' ?
          `${categoriesToSearch.length} カテゴリーを検索中...` :
          `Searching ${categoriesToSearch.length} categories...`;
      }
    }

    // Rate limiter: 45 requests per second (reduced to avoid 500 errors)
    const REQUESTS_PER_SECOND = 45;
    const CATEGORY_BATCH_SIZE = 45; // Process in batches of 45
    const BATCH_DELAY = 1100; // Wait 1.1 seconds between batches to ensure we stay under limit

    // Process categories in batches with rate limiting
    const batches = [];
    for (let i = 0; i < categoriesToSearch.length; i += CATEGORY_BATCH_SIZE) {
      batches.push(categoriesToSearch.slice(i, i + CATEGORY_BATCH_SIZE));
    }

    let completedRequests = 0;
    const totalRequests = categoriesToSearch.length;

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      // Update loading text with batch progress
      if (batches.length > 1) {
        const loadingContainer = categoryList.querySelector('.loading-text');
        if (loadingContainer) {
          loadingContainer.textContent = currentRegion === 'japan' ?
            `バッチ ${batchIndex + 1}/${batches.length} を検索中... (${completedRequests}/${totalRequests} カテゴリー完了)` :
            `Searching batch ${batchIndex + 1}/${batches.length}... (${completedRequests}/${totalRequests} categories completed)`;
        }
      }

      // Create all requests for this batch
      const batchPromises = batch.map(async (categoryId) => {
        let apiCategoryId = categoryId;

        // For global region, we need to map our hierarchical category to actual Mapbox categories
        if (currentRegion === 'global') {
          // Get all Mapbox category IDs that map to this hierarchical category
          const mappedCategories = [];
          const mapping = window.GLOBAL_CATEGORY_MAPPING || {};
          for (const [mapboxId, hierarchicalId] of Object.entries(mapping)) {
            if (hierarchicalId === categoryId) {
              mappedCategories.push(mapboxId);
            }
          }

          // If we have mapped categories, use the first one
          if (mappedCategories.length > 0) {
            apiCategoryId = mappedCategories[0];
          }
        }

        // Perform category search
        const searchUrl = `https://api.mapbox.com/search/searchbox/v1/category/${encodeURIComponent(apiCategoryId)}?` +
          `proximity=${center.lng},${center.lat}&` +
          `language=${currentRegion === 'japan' ? 'ja' : 'en'}&` +
          `limit=${categoriesToSearch.length > 1 ? 10 : 25}&` + // Reduce limit per category when searching many
          `access_token=${mapboxgl.accessToken}`;

        try {
          const searchResponse = await fetch(searchUrl);

          // Check for rate limiting or errors
          if (!searchResponse.ok) {
            console.warn(`Category search failed for ${categoryId}: ${searchResponse.status}`);
            return [];
          }

          const searchData = await searchResponse.json();

          completedRequests++;

          // Update progress bar
          const progressBar = document.getElementById('progressBar');
          if (progressBar) {
            progressBar.style.width = `${(completedRequests / totalRequests) * 30}%`;
          }

          if (searchData.features && searchData.features.length > 0) {
            // Just return the features, don't process details yet
            return searchData.features;
          }
          return [];
        } catch (error) {
          console.error(`Error searching category ${categoryId}:`, error);
          return [];
        }
      });

      // Execute all requests in this batch asynchronously
      const batchResults = await Promise.all(batchPromises);

      // Collect results from this batch for final processing
      batchResults.forEach(results => {
        if (results.length > 0) {
          allSearchResults.push(...results);
        }
      });

      // If there are more batches, wait before starting the next one
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    // Combine and deduplicate results
    const uniqueResults = [];
    const seenIds = new Set();

    for (const feature of allSearchResults) {
      const id = feature.properties.mapbox_id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        uniqueResults.push(feature);
      }
    }

    if (uniqueResults.length === 0) {
      categoryList.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <div class="no-results-text">POIが見つかりませんでした</div>
        </div>
      `;
      statusText.textContent = `${category.name} - 結果なし`;

      // Update breadcrumb to show category name as a link even when no results
      const breadcrumb = document.getElementById('breadcrumb');
      if (currentRegion === 'japan') {
        breadcrumb.innerHTML = `
          <span class="breadcrumb-item">
            <a href="#" class="breadcrumb-link" onclick="navigateToHome()">カテゴリー選択</a>
          </span>
          <span class="breadcrumb-separator"> > </span>
          <span class="breadcrumb-item">${category.name}</span>
        `;
      } else {
        breadcrumb.innerHTML = `
          <span class="breadcrumb-item">
            <a href="#" class="breadcrumb-link" onclick="navigateToHome()">Select Category</a>
          </span>
          <span class="breadcrumb-separator"> > </span>
          <span class="breadcrumb-item">${category.name}</span>
        `;
      }

      return;
    }

    // Update progress
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = '30%';
    }

    statusText.textContent = `${uniqueResults.length} 件のPOI詳細を取得中...`;

    // Now process POI details and add them to the map immediately as they arrive
    const DETAILS_BATCH_SIZE = 5;  // Process 5 POIs at a time for details (reduced from 10)
    const DETAILS_DELAY = 200;  // Longer delay between detail batches (doubled from 100ms)
    const allPOIs = [];
    let displayedCount = 0;

    // Process details in smaller batches to show POIs faster
    for (let i = 0; i < uniqueResults.length; i += DETAILS_BATCH_SIZE) {
      const batch = uniqueResults.slice(i, i + DETAILS_BATCH_SIZE);

      // Process this batch of POIs
      const detailPromises = batch.map(async (feature) => {
        const id = feature.properties.mapbox_id;
        if (!id) return null;

        const poiDetails = await retrievePOIDetails(id);
        if (poiDetails) {
          // Add marker to map immediately
          addSinglePOIMarker(poiDetails, displayedCount++);

          // Update status count in real-time
          statusCount.textContent = `${displayedCount} POIs`;

          return poiDetails;
        }
        return null;
      });

      const batchResults = await Promise.all(detailPromises);
      allPOIs.push(...batchResults.filter(poi => poi !== null));

      // Update progress
      const progress = 30 + ((i + batch.length) / uniqueResults.length * 60);
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      // Fit map to current markers periodically (every 50 POIs or at the end)
      if (displayedCount % 50 === 0 || i + DETAILS_BATCH_SIZE >= uniqueResults.length) {
        if (allPOIs.length > 0) {
          fitMapToMarkers(allPOIs);
        }
      }

      // Small delay between detail batches
      if (i + DETAILS_BATCH_SIZE < uniqueResults.length) {
        await new Promise(resolve => setTimeout(resolve, DETAILS_DELAY));
      }
    }

    // Display results in the sidebar
    displayPOIResults(allPOIs, category);

    // Update progress to complete
    if (progressBar) {
      progressBar.style.width = '100%';
    }

    // Final fit to all markers
    if (allPOIs.length > 0) {
      fitMapToMarkers(allPOIs);
    }

  } catch (error) {
    console.error('Search error:', error);
    categoryList.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">⚠️</div>
        <div class="no-results-text">検索エラーが発生しました</div>
      </div>
    `;
    statusText.textContent = 'エラー';
  }
}

// Retrieve POI details using Details API endpoint
async function retrievePOIDetails(mapboxId) {
  try {
    // Details API doesn't use session_token - only language and access_token
    const url = `https://api.mapbox.com/search/details/v1/retrieve/${mapboxId}?` +
      `language=${currentRegion === 'japan' ? 'ja' : 'en'}&` +
      `attribute_sets=basic,visit,photos,venue&` +  // Request all available attribute sets
      `access_token=${mapboxgl.accessToken}`;

    const response = await fetch(url);

    // Check for 500 errors specifically
    if (response.status === 500) {
      console.warn(`POI ${mapboxId} returned 500 error - skipping (Mapbox internal error)`);
      return null;
    }

    // Check for other non-OK statuses
    if (!response.ok) {
      console.warn(`POI ${mapboxId} returned status ${response.status} - skipping`);
      return null;
    }

    const data = await response.json();

    // Details API returns a single feature, not an array
    if (data && data.type === 'Feature') {
      return data;
    }

    return null;
  } catch (error) {
    console.error(`Failed to retrieve details for ${mapboxId}:`, error);
    return null;
  }
}

// Display POI results
function displayPOIResults(pois, category) {
  const categoryList = document.getElementById('categoryList');
  const statusText = document.getElementById('statusText');
  const statusCount = document.getElementById('statusCount');

  if (pois.length === 0) {
    categoryList.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">📭</div>
        <div class="no-results-text">詳細情報を取得できませんでした</div>
      </div>
    `;
    statusText.textContent = `${category.name} - 詳細なし`;

    // Update breadcrumb to show category name as a link even when no details
    const breadcrumb = document.getElementById('breadcrumb');
    if (currentRegion === 'japan') {
      breadcrumb.innerHTML = `
        <span class="breadcrumb-item">
          <a href="#" class="breadcrumb-link" onclick="navigateToHome()">カテゴリー選択</a>
        </span>
        <span class="breadcrumb-separator"> > </span>
        <span class="breadcrumb-item">${category.name}</span>
      `;
    } else {
      breadcrumb.innerHTML = `
        <span class="breadcrumb-item">
          <a href="#" class="breadcrumb-link" onclick="navigateToHome()">Select Category</a>
        </span>
        <span class="breadcrumb-separator"> > </span>
        <span class="breadcrumb-item">${category.name}</span>
      `;
    }

    return;
  }

  categoryList.innerHTML = '';
  statusText.textContent = `${category.name} の検索結果`;
  statusCount.innerHTML = `<span class="status-count">${pois.length} 件</span>`;

  // Update breadcrumb to show category name as a link
  const breadcrumb = document.getElementById('breadcrumb');
  if (currentRegion === 'japan') {
    breadcrumb.innerHTML = `
      <span class="breadcrumb-item">
        <a href="#" class="breadcrumb-link" onclick="navigateToHome()">カテゴリー選択</a>
      </span>
      <span class="breadcrumb-separator"> > </span>
      <span class="breadcrumb-item">${category.name}</span>
    `;
  } else {
    breadcrumb.innerHTML = `
      <span class="breadcrumb-item">
        <a href="#" class="breadcrumb-link" onclick="navigateToHome()">Select Category</a>
      </span>
      <span class="breadcrumb-separator"> > </span>
      <span class="breadcrumb-item">${category.name}</span>
    `;
  }

  // Get the category icon to use for all POIs in this category
  const categoryIcon = getCategoryIcon(category.icon);

  pois.forEach((poi, index) => {
    const properties = poi.properties || {};
    const tile = document.createElement('div');
    tile.className = 'category-tile';
    tile.tabIndex = index;

    // Extract relevant information
    const name = properties.name || '名称不明';
    const address = properties.full_address || properties.place_formatted || '';
    const distance = calculateDistance(
      map.getCenter(),
      [poi.geometry.coordinates[0], poi.geometry.coordinates[1]]
    );

    tile.innerHTML = `
      <div class="category-icon">${categoryIcon}</div>
      <div class="category-content">
        <div class="category-name">${name}</div>
        <div class="category-count">${address}</div>
        <div class="category-count">${distance}</div>
      </div>
    `;

    tile.onclick = () => selectPOI(poi, index);

    // Add keyboard navigation
    tile.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectPOI(poi, index);
      }
    };

    categoryList.appendChild(tile);
  });

  // Focus first result
  if (pois.length > 0) {
    categoryList.children[0].focus();
  }
}

// Calculate distance from center
function calculateDistance(center, coords) {
  const from = turf.point([center.lng, center.lat]);
  const to = turf.point(coords);
  const distance = turf.distance(from, to, { units: 'kilometers' });

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

// Select a POI and show details
function selectPOI(poi, index) {
  selectedPOI = poi;

  // Update the symbol layer to highlight the selected POI
  const features = markers.map((p, i) => {
    const properties = p.properties || {};

    return {
      'type': 'Feature',
      'geometry': p.geometry,
      'properties': {
        'name': properties.name || '名称不明',
        'index': i,
        'selected': i === index, // Mark the selected POI
        'poiData': JSON.stringify(p)
      }
    };
  });

  // Update the source with selection state
  const source = map.getSource('pois');
  if (source) {
    source.setData({
      'type': 'FeatureCollection',
      'features': features
    });
  }

  // The label layers will automatically update based on the 'selected' property
  // since we're using data-driven styling with ['get', 'selected'] expressions

  // Fly to POI
  map.flyTo({
    center: poi.geometry.coordinates,
    zoom: 16,
    duration: 1000
  });

  // Show POI details popup
  showPOIDetails(poi);
}

// Show POI details in popup with tabs
function showPOIDetails(poi) {
  const popup = document.getElementById('poiPopup');
  const title = document.getElementById('poiTitle');
  const details = document.getElementById('poiDetails');

  const properties = poi.properties || {};
  const metadata = properties.metadata || {};

  title.textContent = properties.name || '名称不明';

  let detailsHTML = '';

  // Photo Gallery at the top (if photos exist)
  if (metadata.photos && metadata.photos.length > 0) {
    detailsHTML += '<div class="poi-photo-gallery"><div class="poi-photos">';
    metadata.photos.forEach(photo => {
      const photoUrl = typeof photo === 'string' ? photo : (photo.url || photo.prefix + photo.suffix);
      detailsHTML += `<img src="${photoUrl}" class="poi-photo-thumbnail" alt="POI Photo" />`;
    });
    detailsHTML += '</div></div>';
  }

  // Prepare tabs and content
  const tabSections = [];

  // 1. Basic Information Tab
  let basicInfoContent = '';
  let hasBasicInfo = false;

  if (properties.full_address) {
    basicInfoContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? '住所' : 'Address'}:</span>
        <span class="poi-detail-value">${properties.full_address}</span>
      </div>`;
    hasBasicInfo = true;
  }

  if (properties.poi_category && properties.poi_category.length > 0) {
    basicInfoContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? 'カテゴリー' : 'Categories'}:</span>
        <span class="poi-detail-value">${properties.poi_category.join(', ')}</span>
      </div>`;
    hasBasicInfo = true;
  }

  if (properties.brand && properties.brand.length > 0) {
    basicInfoContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? 'ブランド' : 'Brand'}:</span>
        <span class="poi-detail-value">${properties.brand.join(', ')}</span>
      </div>`;
    hasBasicInfo = true;
  }

  if (properties.operational_status) {
    basicInfoContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? '営業状況' : 'Status'}:</span>
        <span class="poi-detail-value">${properties.operational_status === 'active'
          ? (currentRegion === 'japan' ? '営業中' : 'Open')
          : (currentRegion === 'japan' ? '閉店' : 'Closed')}</span>
      </div>`;
    hasBasicInfo = true;
  }

  if (hasBasicInfo) {
    tabSections.push({
      id: 'basic',
      label: currentRegion === 'japan' ? '基本情報' : 'Basic Info',
      content: basicInfoContent
    });
  }

  // 2. Contact Tab
  let contactContent = '';
  let hasContact = false;

  if (metadata.phone) {
    contactContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? '電話' : 'Phone'}:</span>
        <span class="poi-detail-value">${metadata.phone}</span>
      </div>`;
    hasContact = true;
  }

  if (metadata.website) {
    contactContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? 'ウェブサイト' : 'Website'}:</span>
        <span class="poi-detail-value"><a href="${metadata.website}" target="_blank">${metadata.website}</a></span>
      </div>`;
    hasContact = true;
  }

  if (metadata.email) {
    contactContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? 'メール' : 'Email'}:</span>
        <span class="poi-detail-value">${metadata.email}</span>
      </div>`;
    hasContact = true;
  }

  if (metadata.fax) {
    contactContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? 'FAX' : 'Fax'}:</span>
        <span class="poi-detail-value">${metadata.fax}</span>
      </div>`;
    hasContact = true;
  }

  // Add social media to contact tab
  if (metadata.facebook || metadata.instagram || metadata.twitter) {
    if (metadata.facebook) {
      contactContent += `
        <div class="poi-detail">
          <span class="poi-detail-label">Facebook:</span>
          <span class="poi-detail-value">${metadata.facebook}</span>
        </div>`;
      hasContact = true;
    }
    if (metadata.instagram) {
      contactContent += `
        <div class="poi-detail">
          <span class="poi-detail-label">Instagram:</span>
          <span class="poi-detail-value">${metadata.instagram}</span>
        </div>`;
      hasContact = true;
    }
    if (metadata.twitter) {
      contactContent += `
        <div class="poi-detail">
          <span class="poi-detail-label">Twitter:</span>
          <span class="poi-detail-value">${metadata.twitter}</span>
        </div>`;
      hasContact = true;
    }
  }

  if (hasContact) {
    tabSections.push({
      id: 'contact',
      label: currentRegion === 'japan' ? '連絡先' : 'Contact',
      content: contactContent
    });
  }

  // 3. Hours Tab
  let hoursContent = '';
  let hasHours = false;

  if (metadata.open_hours) {
    if (metadata.open_hours.periods && metadata.open_hours.periods.length > 0) {
      const dayNames = currentRegion === 'japan'
        ? ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      hoursContent += `<div class="poi-detail"><div class="poi-detail-value">`;

      const hoursByDay = {};
      metadata.open_hours.periods.forEach(period => {
        // Check if period has required properties
        if (!period.open || !period.close || !period.open.time || !period.close.time) {
          return; // Skip this period if data is missing
        }
        const day = period.open.day;
        if (!hoursByDay[day]) hoursByDay[day] = [];
        const openTime = period.open.time.substring(0,2) + ':' + period.open.time.substring(2);
        const closeTime = period.close.time.substring(0,2) + ':' + period.close.time.substring(2);
        hoursByDay[day].push(`${openTime} - ${closeTime}`);
      });

      for (let day = 0; day < 7; day++) {
        if (hoursByDay[day]) {
          hoursContent += `<div>${dayNames[day]}: ${hoursByDay[day].join(', ')}</div>`;
        } else {
          hoursContent += `<div>${dayNames[day]}: ${currentRegion === 'japan' ? '定休日' : 'Closed'}</div>`;
        }
      }

      hoursContent += `</div></div>`;
      hasHours = true;
    } else if (metadata.open_hours.weekday_text) {
      hoursContent += `<div class="poi-detail"><div class="poi-detail-value">`;
      metadata.open_hours.weekday_text.forEach(day => {
        hoursContent += `<div>${day}</div>`;
      });
      hoursContent += `</div></div>`;
      hasHours = true;
    }
  }

  if (hasHours) {
    tabSections.push({
      id: 'hours',
      label: currentRegion === 'japan' ? '営業時間' : 'Hours',
      content: hoursContent
    });
  }

  // 4. Services Tab
  let servicesContent = '';
  let hasServices = false;

  const services = [];
  if (metadata.delivery) services.push(currentRegion === 'japan' ? '配達' : 'Delivery');
  if (metadata.drive_through) services.push(currentRegion === 'japan' ? 'ドライブスルー' : 'Drive-through');
  if (metadata.reservable) services.push(currentRegion === 'japan' ? '予約可' : 'Reservations');
  if (metadata.takeout) services.push(currentRegion === 'japan' ? 'テイクアウト' : 'Takeout');
  if (metadata.wheelchair_accessible) services.push(currentRegion === 'japan' ? '車椅子対応' : 'Wheelchair accessible');
  if (metadata.parking_available) services.push(currentRegion === 'japan' ? '駐車場' : 'Parking');
  if (metadata.valet_parking) services.push(currentRegion === 'japan' ? 'バレーパーキング' : 'Valet parking');
  if (metadata.street_parking) services.push(currentRegion === 'japan' ? '路上駐車可' : 'Street parking');

  if (services.length > 0) {
    servicesContent += `
      <div class="poi-detail">
        <span class="poi-detail-value">${services.join('<br>')}</span>
      </div>`;
    hasServices = true;
  }

  // Dining options
  const diningOptions = [];
  if (metadata.serves_breakfast) diningOptions.push(currentRegion === 'japan' ? '朝食' : 'Breakfast');
  if (metadata.serves_brunch) diningOptions.push(currentRegion === 'japan' ? 'ブランチ' : 'Brunch');
  if (metadata.serves_lunch) diningOptions.push(currentRegion === 'japan' ? 'ランチ' : 'Lunch');
  if (metadata.serves_dinner) diningOptions.push(currentRegion === 'japan' ? 'ディナー' : 'Dinner');
  if (metadata.serves_beer) diningOptions.push(currentRegion === 'japan' ? 'ビール' : 'Beer');
  if (metadata.serves_wine) diningOptions.push(currentRegion === 'japan' ? 'ワイン' : 'Wine');

  if (diningOptions.length > 0) {
    servicesContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? '食事オプション' : 'Dining Options'}:</span>
        <span class="poi-detail-value">${diningOptions.join('<br>')}</span>
      </div>`;
    hasServices = true;
  }

  if (hasServices) {
    tabSections.push({
      id: 'services',
      label: currentRegion === 'japan' ? 'サービス' : 'Services',
      content: servicesContent
    });
  }

  // 5. Reviews Tab
  let reviewsContent = '';
  let hasReviews = false;

  if (metadata.rating) {
    reviewsContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? '評価' : 'Rating'}:</span>
        <span class="poi-detail-value">${metadata.rating} / 5</span>
      </div>`;
    hasReviews = true;
  }

  if (metadata.review_count) {
    reviewsContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? 'レビュー数' : 'Reviews'}:</span>
        <span class="poi-detail-value">${metadata.review_count}</span>
      </div>`;
    hasReviews = true;
  }

  if (metadata.price_level) {
    reviewsContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? '価格帯' : 'Price Level'}:</span>
        <span class="poi-detail-value">${metadata.price_level}</span>
      </div>`;
    hasReviews = true;
  }

  if (metadata.popularity) {
    reviewsContent += `
      <div class="poi-detail">
        <span class="poi-detail-label">${currentRegion === 'japan' ? '人気度' : 'Popularity'}:</span>
        <span class="poi-detail-value">${(metadata.popularity * 100).toFixed(0)}%</span>
      </div>`;
    hasReviews = true;
  }

  if (hasReviews) {
    tabSections.push({
      id: 'reviews',
      label: currentRegion === 'japan' ? '評価' : 'Reviews',
      content: reviewsContent
    });
  }

  // Build tab navigation
  if (tabSections.length > 0) {
    detailsHTML += '<div class="poi-tabs">';
    tabSections.forEach((tab, index) => {
      detailsHTML += `
        <button class="poi-tab ${index === 0 ? 'active' : ''}"
                onclick="switchPOITab('${tab.id}')"
                data-tab="${tab.id}">
          ${tab.label}
        </button>`;
    });
    detailsHTML += '</div>';

    // Tab content
    tabSections.forEach((tab, index) => {
      detailsHTML += `
        <div class="poi-tab-content ${index === 0 ? 'active' : ''}" data-content="${tab.id}">
          ${tab.content}
        </div>`;
    });
  }

  // Raw JSON for debugging (always at the bottom)
  detailsHTML += `
    <details style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
      <summary style="cursor: pointer; font-weight: bold;">Raw API Response (Debug)</summary>
      <pre style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px; overflow-x: auto; font-size: 11px; line-height: 1.4;">
${JSON.stringify(poi, null, 2)}
      </pre>
    </details>
  `;

  details.innerHTML = detailsHTML;

  // Show popup
  popup.classList.add('show');
}

// Close POI popup
function closePOIPopup() {
  const popup = document.getElementById('poiPopup');
  popup.classList.remove('show');

  // Reset all POIs to unselected state
  if (markers && markers.length > 0) {
    const features = markers.map((p, i) => {
      const properties = p.properties || {};

      // Keep the existing maki and use the stored icon-name
      const makiIcon = properties.maki || 'marker';
      // Use the icon name that was stored when the POIs were first added
      const iconName = p._iconName || 'marker-15';

      return {
        'type': 'Feature',
        'geometry': p.geometry,
        'properties': {
          'name': properties.name || '名称不明',
          'maki': makiIcon,
          'icon-name': iconName,
          'index': i,
          'selected': false, // All unselected
          'poiData': JSON.stringify(p)
        }
      };
    });

    // Update the source
    const source = map.getSource('pois');
    if (source) {
      source.setData({
        'type': 'FeatureCollection',
        'features': features
      });
    }
  }
}

// Function to switch tabs in POI details
window.switchPOITab = function(tabId) {
  // Update active tab button
  document.querySelectorAll('.poi-tab').forEach(tab => {
    if (tab.dataset.tab === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update active tab content
  document.querySelectorAll('.poi-tab-content').forEach(content => {
    if (content.dataset.content === tabId) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
};

// Add POI markers to map using symbol layer
function addPOIMarkers(pois) {
  console.log('Adding POI markers:', pois.length);

  // Create GeoJSON features from POIs
  const features = pois.map((poi, index) => {
    const properties = poi.properties || {};

    const feature = {
      'type': 'Feature',
      'geometry': poi.geometry,
      'properties': {
        'name': properties.name || '名称不明',
        'index': index,
        'selected': false, // Add default selected state
        // Store the full POI data as a JSON string for retrieval on click
        'poiData': JSON.stringify(poi)
      }
    };

    console.log(`POI ${index}: ${properties.name}`);
    return feature;
  });

  // Update the source data
  const source = map.getSource('pois');
  if (source) {
    const geojson = {
      'type': 'FeatureCollection',
      'features': features
    };
    console.log('Setting GeoJSON data with', features.length, 'features');
    source.setData(geojson);
  } else {
    console.error('POI source not found!');
  }

  // Store POI data for reference
  markers = pois;
}

// Add a single POI marker to the map
function addSinglePOIMarker(poi, index) {
  const properties = poi.properties || {};

  const feature = {
    'type': 'Feature',
    'geometry': poi.geometry,
    'properties': {
      'name': properties.name || '名称不明',
      'index': index,
      'selected': false,
      'poiData': JSON.stringify(poi)
    }
  };

  // Get current features from the source
  const source = map.getSource('pois');
  if (source) {
    const currentData = source._data;
    const currentFeatures = currentData && currentData.features ? currentData.features : [];

    // Add the new feature
    currentFeatures.push(feature);

    // Update the source with the new feature
    source.setData({
      'type': 'FeatureCollection',
      'features': currentFeatures
    });
  }

  // Add to markers array for reference
  markers.push(poi);
}

// Clear all markers
function clearMarkers() {
  // Clear the symbol layer by setting empty data
  const source = map.getSource('pois');
  if (source) {
    source.setData({
      'type': 'FeatureCollection',
      'features': []
    });
  }
  markers = [];
}

// Fit map to show all markers
function fitMapToMarkers(pois) {
  if (pois.length === 0) return;

  const bounds = new mapboxgl.LngLatBounds();

  pois.forEach(poi => {
    bounds.extend(poi.geometry.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 50, bottom: 50, left: 450, right: 50 },
    duration: 1000
  });
}

// Initialize on load
// Switch between regions
async function switchRegion(region) {
  if (region === currentRegion) return;

  // Update region
  currentRegion = region;

  // Update UI
  document.querySelectorAll('.region-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === region);
  });

  // Global categories should already be loaded from the included script
  if (region === 'global' && (!window.GLOBAL_CATEGORIES || window.GLOBAL_CATEGORIES.length === 0)) {
    console.error('Global categories not loaded. Make sure global-categories.js is included.');
    return;
  }

  // Move map to appropriate location based on region and update language
  if (map) {
    if (region === 'japan') {
      // Move to Tokyo
      map.flyTo({
        center: [139.7671, 35.6812],
        zoom: 11,
        duration: 1500
      });

      // Set map labels to Japanese
      updateMapLanguage('ja');
    } else {
      // Move to San Francisco for global
      map.flyTo({
        center: [-122.4194, 37.7749],
        zoom: 12,
        duration: 1500
      });

      // Set map labels to English
      updateMapLanguage('en');
    }
  }

  // Reset navigation
  currentPath = [];
  currentCategory = null;

  // Update breadcrumb based on region
  const breadcrumb = document.getElementById('breadcrumb');
  if (region === 'japan') {
    breadcrumb.innerHTML = '<span class="breadcrumb-item">カテゴリー選択</span>';
  } else {
    breadcrumb.innerHTML = '<span class="breadcrumb-item">Select Category</span>';
  }

  // Clear markers
  clearMarkers();

  // Rebuild and display categories
  const hierarchy = buildCategoryHierarchy();
  displayCategories(Object.values(hierarchy));

  // Update status text
  const statusText = document.getElementById('statusText');
  if (statusText) {
    statusText.textContent = region === 'japan' ?
      'カテゴリーを選択してください' :
      'Select a category';
  }
}

// Make switchRegion available globally
window.switchRegion = switchRegion;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initMap();

  // Display top-level categories
  const hierarchy = buildCategoryHierarchy();
  displayCategories(Object.values(hierarchy));

  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    const categoryList = document.getElementById('categoryList');
    const focusedElement = document.activeElement;

    if (!focusedElement || !focusedElement.classList.contains('category-tile')) {
      return;
    }

    const tiles = Array.from(categoryList.children).filter(
      child => child.classList.contains('category-tile')
    );
    const currentIndex = tiles.indexOf(focusedElement);

    switch(e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          tiles[currentIndex - 1].focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < tiles.length - 1) {
          tiles[currentIndex + 1].focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (currentPath.length > 0) {
          // Go back one level
          if (currentPath.length === 1) {
            navigateToHome();
          } else {
            navigateToLevel(currentPath.length - 2);
          }
        }
        // Close POI popup if open
        closePOIPopup();
        break;
    }
  });
});