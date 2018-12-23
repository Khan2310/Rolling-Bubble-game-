var res = {
  HelloWorld_png: "res/HelloWorld.png",
  background_png: "res/skyBackground.png",
  ground_png: "res/ground.png",
  spikeBottom_png: "res/spikeBottom.png",
  spikeTop_png: "res/spikeTop.png",
  bubbleHead_png: "res/bubbleHeadSmall.png",
  base_png: "res/base2.png"
};

var g_resources = [];
for (var i in res) {
  g_resources.push(res[i]);
}

// var backgroundSprite = cc.Sprite.create(res.whiteBricksBackground_png);
// backgroundSprite.setScaleX(0.8);
// backgroundSprite.setScaleY(0.5);
// backgroundSprite.setPosition(cc.p(size.width / 2, size.height / 2));
// this.addChild(backgroundSprite);
