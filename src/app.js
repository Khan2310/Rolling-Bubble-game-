var world;
var changePos = true;
var setClick = true;
var currPosX;
var currPosY;
var shapeArray = [];
var groundHight = 40;
var self = null;
var scorePoint = 0;
var game = cc.Layer.extend({
  init: function() {
    this._super();
    self = this;
    var size = cc.winSize;

    var backgroundSprite = cc.Sprite.create(res.background_png);
    backgroundSprite.setPosition(cc.p(size.height / 2, size.width / 2));
    this.addChild(backgroundSprite);

    /////////////Schedule Update/////////////////////////
    var timeCallback = function(dt) {
      this.spawnBlock();
      //scorePoint += 1;
      cc.log("random block");
    };
    var handelScorePoint = function(dt) {
      scorePoint += 1;
    };
    this.schedule(timeCallback, 4);
    this.schedule(handelScorePoint, 1);
    /////////////Schedule Update end/////////////////////////

    world = new cp.Space();
    world.gravity = cp.v(0, -500); /////////////////////////////////////gravity
    var debugDraw = cc.PhysicsDebugNode.create(world);
    debugDraw.setVisible(false);
    this.addChild(debugDraw);
    /////////////////////////////////////adding body/////////////////////////////
    this.addBody(
      450,
      640,
      1200,
      groundHight,
      false,
      res.spikeTop_png,
      "ground"
    ); ////////////////////////////spike Top////////////////////// array[0]
    this.addBody(
      450,
      1,
      1200,
      groundHight,
      false,
      res.spikeBottom_png,
      "ground"
    ); ////////////////////////////spike bottom//////////////////////// array[1]
    this.addBody(-20, 320, 80, 590, false, null, "leftWall"); /////////side wall
    this.addBody(980, 320, 80, 590, false, null, "rightWall"); /////////side wall
    this.addBody(500, 150, 72, 75, true, res.bubbleHead_png, "ball"); //ball dynamic// array[4]
    this.addBody(500, 71, 250, 50, false, res.base_png, "solid"); //static base

    this.scheduleUpdate();
    cc.eventManager.addListener(
      {
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        onTouchBegan: function(touch, event) {
          //console.log("clicked");
          if (true) {
            if (shapeArray[4].name == "ball") {
              var boxBody = shapeArray[4].getBody();
              if (touch._point.x >= 500) {
                boxBody.applyImpulse(cp.v(60000, 0), cp.v(0, 0));
              } else if (touch._point.x < 500) {
                boxBody.applyImpulse(cp.v(-60000, 0), cp.v(0, 0));
              }

              console.log("apply force");
              setClick = true;
            }
          }
        }
      },
      this
    );
    world.setDefaultCollisionHandler(this.collisionBegin, null, null, null);
  },
  addBody: function(posX, posY, width, height, isDynamic, spriteImage, type) {
    // create the physics body somehow
    var body = null;
    if (isDynamic) {
      if (isDynamic == "solid") {
        body = new cp.Body(Infinity, Infinity);
      } else if (type == "ball") {
        body = new cp.Body(500, cp.momentForCircle(500, 0, 30, cp.v(0, 0))); //////////ball image radius
        //console.log("ball");
      } else {
        body = new cp.Body(
          500,
          cp.momentForBox(500, width, height) /////////////////////dynamic body mass
        );
      }
    } else {
      body = new cp.Body(Infinity, Infinity);
    }
    body.setPos(cp.v(posX, posY));
    var bodySprite = cc.Sprite.create(spriteImage);
    gameLayer.addChild(bodySprite, 0); ///////////////////////////////adding sprite
    bodySprite.setPosition(posX, posY);
    if (isDynamic) {
      world.addBody(body);
    }
    var shape = null;
    if (type == "ball") {
      shape = new cp.CircleShape(body, 32, cp.v(0, 0)); /////////////////ball shape radius
    } else {
      shape = new cp.BoxShape(body, width, height);
    }
    shape.setFriction(100); //////////////////////////////////////////////friction
    //shape.setElasticity(0);
    shape.name = type;
    shape.image = bodySprite;
    world.addShape(shape);
    shapeArray.push(shape);
  },
  update: function(dt) {
    // update the world somehow
    world.step(dt);
    for (var i = shapeArray.length - 1; i >= 0; i--) {
      shapeArray[i].image.x = shapeArray[i].body.p.x;
      shapeArray[i].image.y = shapeArray[i].body.p.y;
      var angle = Math.atan2(
        -shapeArray[i].body.rot.y,
        shapeArray[i].body.rot.x
      );
      shapeArray[i].image.rotation = angle * 57.2957795;
    }

    var staticBlock = null;

    for (var blockNum = 0; blockNum < shapeArray.length; blockNum++) {
      blockName = shapeArray[blockNum].name;
      staticBlock = shapeArray[blockNum].getBody();
      if (blockName == "solid") {
        console.log(blockName);
        staticBlock.setPos(cp.v(staticBlock.p.x, staticBlock.p.y + 1));
      }
      //console.log("block loop");
    }
    this.scoreLabel(scorePoint);
  },
  collisionBegin: function(arbiter, space) {
    if (
      (arbiter.a.name == "ball" && arbiter.b.name == "solid") ||
      (arbiter.b.name == "ball" && arbiter.a.name == "solid")
    ) {
      //console.log("On block top!!!!");
      // space.addPostStepCallback(function() {
      //   space.removeShape(shapeArray[i]);
      // });
    } else if (arbiter.a.name == "ball" && arbiter.b.name == "ground") {
      console.log("On ground top!!!!");
      space.addPostStepCallback(function() {
        space.removeShape(arbiter.a);
        arbiter.a.image.visible = false;
      });
      var gameOver = null;
      gameOver = new cc.LabelTTF("*** Game Over ***", "Arial", 80);
      gameOver.color = cc.color(245, 62, 62);
      gameOver.setPosition(cc.p(500, 320));
      self.addChild(gameOver);
      cc.director.end();
    }

    if (arbiter.a.name == "solid" && arbiter.b.name == "ground") {
      space.addPostStepCallback(function() {
        // console.log(space);
        //space.removeFromParent(arbiter.a);
        space.removeShape(arbiter.a); ////////////////////removing shape
        arbiter.a.image.visible = false; //////////////image visibility
      });
    }

    return true;
  },
  spawnBlock: function() {
    var rand = Math.floor(Math.random() * 3 + 1);
    if (rand == 1) {
      this.addBody(200, 61, 255, 50, false, res.base_png, "solid");
    } else if (rand == 2) {
      this.addBody(500, 61, 255, 50, false, res.base_png, "solid");
    } else if (rand == 3) {
      this.addBody(800, 61, 255, 50, false, res.base_png, "solid");
    }
  },
  scoreLabel: function(score) {
    this.removeChildByTag(2, true);
    var scoreText = null;
    scoreText = new cc.LabelTTF("Score: ", "Arial", 30);
    scoreText.setTag(2);
    scoreText.color = cc.color(255, 251, 102);
    scoreText.setPosition(cc.p(120, 570));
    this.addChild(scoreText);

    this.removeChildByTag(1, true);
    var scoreNum = null;
    var scoreNumString = String(score);
    scoreNum = new cc.LabelTTF(scoreNumString, "Arial", 30);
    scoreNum.setTag(1);
    scoreNum.color = cc.color(255, 251, 102);
    scoreNum.setPosition(cc.p(175, 570));
    this.addChild(scoreNum);
  }
});

var gameScene = cc.Scene.extend({
  onEnter: function() {
    this._super();
    gameLayer = new game();
    gameLayer.init();
    this.addChild(gameLayer);
  }
});
