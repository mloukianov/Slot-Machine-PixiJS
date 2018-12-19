/* TODO: 
    - Textures:
    - add button choose stake and show current stake - > name stake
    - add showcase Total money  - > name balance
    - add showcase total win - > name win
    - add coin image
    - add border to text/restyle
    - Methods:
    - Calculate total and left balance
     - Calculate number of wins
     - Win Logic
     - Stake logic
     - Add tweens pixi, tweens
     - Add sound pixi.sound
*/

const app = new PIXI.Application(640, 360, {
    transparent: true,
    autoResize: true,
    resolution: devicePixelRatio
});

document.querySelector("#game-canvas").appendChild(app.view);

PIXI.loader
    .add("blue", "./images/Gem Blue.png")
    .add("green", "./images/Gem Green.png")
    .add("orange", "./images/Gem Orange.png")
    .add("buttonActive", "./images/spin.png")
    .add("buttonDeactivated", "./images/BTN_Spin_deactivated.png")
    .add("coins", "./images/coin.png")
    .add("yellowBar", "./images/leftArrow.png")
    .add("blueBar", "./images/rightArrow.png")
    .add("background", "./images/background.png")
    .load(onAssetsLoaded);


let REEL_WIDTH = 90;
let SYMBOL_SIZE = 80;

//onAssetsLoaded handler builds the example.
function onAssetsLoaded() {

    //Create different slot symbols.
    const slotTextures = [
        PIXI.Texture.fromImage("./images/Gem Blue.png"),
        PIXI.Texture.fromImage("./images/Gem Green.png"),
        PIXI.Texture.fromImage("./images/Gem Orange.png")
    ];

    // draw a rounded rectangle
    let graphicsOne = new PIXI.Graphics();
    graphicsOne.lineStyle(2, 0xFF00FF, 1);
    graphicsOne.beginFill(0xFF00BB, 0.25);
    graphicsOne.drawRoundedRect(50, 296, 120, 35, 15);
    graphicsOne.endFill();

    // draw a rounded rectangle
    let graphicsTwo = new PIXI.Graphics();
    graphicsTwo.lineStyle(2, 0xFF00FF, 1);
    graphicsTwo.beginFill(0xFF00BB, 0.25);
    graphicsTwo.drawRoundedRect(255, 296, 120, 35, 15);
    graphicsTwo.endFill();


    let coins = new PIXI.Sprite.fromImage("./images/coin.png");
    coins.x = app.screen.width - 150;
    coins.y = 2;
    coins.scale.x *= 0.08;
    coins.scale.y *= 0.08;

    let leftArrow = new PIXI.Sprite.fromImage("./images/leftArrow.png");
    leftArrow.x = 220; //40
    leftArrow.y = 296;
    leftArrow.scale.x *= 0.05;
    leftArrow.scale.y *= 0.05;

    let rightArrow = new PIXI.Sprite.fromImage("./images/rightArrow.png");
    rightArrow.x = 380; //255
    rightArrow.y = 296;
    rightArrow.scale.x *= 0.05;
    rightArrow.scale.y *= 0.05;

    //Build the reels
    const reels = [];
    const reelContainer = new PIXI.Container();
    for (let i = 0; i < 3; i++) {
        const rc = new PIXI.Container();
        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter()
        };
        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        //Build the symbols
        for (let j = 0; j < 4; j++) {
            const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
            //Scale the symbol to fit symbol area.
            symbol.y = j * SYMBOL_SIZE;
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
            symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 9);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    /* TODO:
        -change style of top and bottom canvas background
        - draw the buttons
        FIXME:
        - fix the reel position
        - responsive on all devices
    */

    //Build top & bottom covers and position reelContainer
    const margin = 50;
    reelContainer.y = margin;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5);
    const top = new PIXI.Graphics();
    top.beginFill(0, 1);
    top.drawRect(0, 0, app.screen.width, margin);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0, 1);
    bottom.drawRect(0, 240 + margin, app.screen.width, margin);

    //Add play text
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 300
    });

    /* const playText = new PIXI.Text('Spin the wheels!', style);
    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
    bottom.addChild(playText);
 */
    //Add header text
    const headerText = new PIXI.Text('Slot Machine Game', style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    //Spin button
    let buttonActive = new PIXI.Sprite(PIXI.Texture.fromImage("./images/spin.png"));
    buttonActive.x = 450;
    buttonActive.y = 235;
    buttonActive.scale.x *= 0.2;
    buttonActive.scale.y *= 0.2;

    app.stage.addChild(top);
    app.stage.addChild(bottom);
    app.stage.addChild(buttonActive);
    app.stage.addChild(coins);
    app.stage.addChild(graphicsOne);
    app.stage.addChild(graphicsTwo);
    app.stage.addChild(leftArrow);
    app.stage.addChild(rightArrow);

    //Set the interactivity.
    buttonActive.interactive = true;
    buttonActive.buttonMode = true;
    buttonActive.addListener("pointerdown", () => {
        startPlay();
    });


    //Set the interactivity.
    bottom.interactive = true;
    bottom.buttonMode = true;
    bottom.addListener("pointerdown", () => {
        startPlay();
    });

    let running = false;

    //Function to start playing.
    function startPlay() {
        if (running) return;
        running = true;

        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            tweenTo(r, "position", r.position + 10 + i * 5 + extra, 2500 + i * 600 + extra * 600, backout(0.6), null, i == reels.length - 1 ? reelsComplete : null);
        }
    }

    //Reels done handler.
    function reelsComplete() {
        running = false;
    }

    // Listen for animate update.
    app.ticker.add(delta => {
        //Update the slots.
        for (const r of reels) {
            //Update blur filter y amount based on speed.
            //This would be better if calculated with time in mind also. Now blur depends on frame rate.
            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            //Update symbol positions on reel.
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = (r.position + j) % r.symbols.length * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    //Detect going over and swap a texture. 
                    //This should in proper product be determined from some logical reel.
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    });
}

//Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
const tweening = [];

function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now()
    };

    tweening.push(tween);
    return tween;
}
// Listen for animate update.
app.ticker.add(delta => {
    const now = Date.now();
    const remove = [];
    for (var i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);

        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase == 1) {
            t.object[t.property] = t.target;
            if (t.complete)
                t.complete(t);
            remove.push(t);
        }
    }
    for (var i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
    }
});

//Basic lerp funtion.
function lerp(a1, a2, t) {
    return a1 * (1 - t) + a2 * t;
}

//Backout function from tweenjs.
//https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
backout = amount => t => --t * t * ((amount + 1) * t + amount) + 1;