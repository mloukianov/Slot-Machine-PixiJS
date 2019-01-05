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
    antialias: true,
    resolution: 1
});

document.body.appendChild(app.view);

class Resources {
    constructor(balance, stake, win) {
        this.balance = 500;
        this.stake = 1;
        this.win = 0;
        this.playing = false;
        this.addStake = function addStake() {
            if (playerResources.stake >= 0 && playerResources.stake <= 20) {
                playerResources.stake = playerResources.stake + 1;
            }
        };
        this.minusStake = function minusStake() {
            if (playerResources.stake >= 0 && playerResources.stake <= 20) {
                playerResources.stake --;
            }
        };
    }
}
let playerResources = new Resources();

PIXI.loader
    .add("blue", "./assets/images/Gem Blue.png")
    .add("green", "./assets/images/Gem Green.png")
    .add("orange", "./assets/images/Gem Orange.png")
    .add("buttonActive", "./assets/images/spin.png")
    .add("buttonDeactivated", "./assets/images/BTN_Spin_deactivated.png")
    .add("coins", "./assets/images/coin.png")
    .add("yellowBar", "./assets/images/leftArrow.png")
    .add("blueBar", "./assets/images/rightArrow.png")
    .add("background", "./assets/images/background.png")
    .load(onAssetsLoaded);


const REEL_WIDTH = 90;
const SYMBOL_SIZE = 80;
let reels = [];
let anotherSlot = [];
let slotTextures = [];
let anotherSlotTextures = [];
let reelContainer;
let reel;

let blue = PIXI.Texture.fromImage("./assets/images/Gem Blue.png");
let green = PIXI.Texture.fromImage("./assets/images/Gem Green.png");
let orange = PIXI.Texture.fromImage("./assets/images/Gem Orange.png");

//onAssetsLoaded handler builds the example.
function onAssetsLoaded() {

    //Create different slot symbols.
    slotTextures = [
        blue,
        green,
        orange
    ];

    //container for footer items
    const footerContainer = new PIXI.Container();

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

    //draw coin image for total balance
    let coins = new PIXI.Sprite.fromImage("./assets/images/coin.png");
    coins.x = app.screen.width - 150;
    coins.y = 2;
    coins.scale.x *= 0.08;
    coins.scale.y *= 0.08;

  /*   // draw left arrow for stake selector
    let leftArrow = new PIXI.Sprite.fromImage("./images/leftArrow.png");
    leftArrow.x = 220; //40
    leftArrow.y = 296;
    leftArrow.scale.x *= 0.05;
    leftArrow.scale.y *= 0.05;
    leftArrow.interactive = true;
    leftArrow.buttonMode = true; */

  /*   // draw right Arrow button for stake selector
    let rightArrow = new PIXI.Sprite.fromImage("./images/rightArrow.png");
    rightArrow.x = 380; //255
    rightArrow.y = 296;
    rightArrow.scale.x *= 0.05;
    rightArrow.scale.y *= 0.05;
    rightArrow.interactive = true;
    rightArrow.buttonMode = true; */

    const buttonsHolder = new PIXI.Container();
    buttonsHolder.x = 0;
    buttonsHolder.y = 286;
    const makeImageButton = (image, audioMP3, audioOGG, x = 0, y = 0, scale) => {
        const button = PIXI.Sprite.fromImage(image);
        const sound = new Howl({
            src: [audioMP3, audioOGG]
        });
        button.sound = sound;
        button.interactive = true;
        button.buttonMode = true;
        button.on('pointerdown', event => sound.play());
        buttonsHolder.addChild(button);
        button.x = x;
        button.y = y;
        button.scale.set(scale);
        return button;
    };

    const leftArrow = makeImageButton(
        './assets/images/leftArrow.png',
        './assets/sounds/mp3/multimedia_button_click_006.mp3',
        './assets/sounds/ogg/multimedia_button_click_006.mp3',
        220,
        10,
        0.05
    );

    const rightArrow = makeImageButton(
        './assets/images/rightArrow.png',
        './assets/sounds/mp3/multimedia_button_click_006.mp3',
        './assets/sounds/ogg/multimedia_button_click_006.mp3',
        380,
        10,
        0.05
    );

        //check for event on click on rightArrow button and call AddStake function
        rightArrow.addListener("pointerdown", () => {
            console.log(`right arrow clicked ${playerResources.stake}`);
            playerResources.addStake();
            // FIXME: Bug the text is not changing when the value of stake is changing, counting is not correct when switching buttons
        });

        //check for event on click on leftArrow button and call MinusStake function
        leftArrow.addListener("pointerdown", () => {
            console.log(`left arrow clicked ${playerResources.stake}`);
            playerResources.minusStake();
            footerContainer.addChild(stackText);
        });

    //Build the reels
    reelContainer = new PIXI.Container();
    for (let i = 0; i < 3; i++) {
        const rc = new PIXI.Container();
        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter()
        };

        //let newposition = reel.reelContainer.getChildIndex;
        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        //Build the symbols
        for (let j = 0; j < 3; j++) {
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
        FIXME:
        - responsive on all devices
    */

    //Build top & bottom covers and position reelContainer
    const margin = 50;
    reelContainer.y = margin * 2.8;
    reelContainer.x = 200;
    const top = new PIXI.Graphics();
    top.beginFill(0, 1);
    top.drawRect(0, 0, app.screen.width, margin);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0, 1);
    bottom.drawRect(0, 240 + margin, app.screen.width, margin);

    //Add text Style properties
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

    //Add header text
    const headerText = new PIXI.Text('Slot Machine Game', style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    //Spin button
    let buttonActive = new PIXI.Sprite(PIXI.Texture.fromImage("./assets/images/spin.png"));
    buttonActive.x = 450;
    buttonActive.y = 235;
    buttonActive.scale.x *= 0.2;
    buttonActive.scale.y *= 0.2;
    //Set the interactivity.
    buttonActive.interactive = true;
    buttonActive.buttonMode = true;
    //check for event on spin button
    buttonActive.addListener('pointerdown', () => {
        startPlay();
        console.log(`button clicked`);
    });

    //Stack Selector Text between arrow buttons
    let stackText = new PIXI.Text(`${playerResources.stake}`, style);
    stackText.x = (app.screen.width / 2 - 10);
    stackText.y = 295;
    footerContainer.addChild(stackText);

    //Add win text to the canvas
    let winText = new PIXI.Text(`${playerResources.win}`, style);
    winText.x = 100;
    winText.y = 295;
    footerContainer.addChild(winText);

    //Add balance text to the canvas
    let balanceText = new PIXI.Text(`${playerResources.balance}`, style);
    balanceText.x = 535;
    balanceText.y = 7;
    top.addChild(balanceText);

    app.stage.addChild(top);
    app.stage.addChild(coins);
    app.stage.addChild(footerContainer);
    footerContainer.addChild(
        bottom,
        graphicsOne,
        graphicsTwo,
        buttonsHolder,
        buttonActive,
        stackText,
        winText);
    footerContainer.x = 0;
    footerContainer.y = 20;

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

    //function to get symbols index/position
    /*     Response balance = "98.80" stake = "1.20" win = "0.00" >
            <SymbolGrid column_id="0" symbols="2,2,1" />
            <SymbolGrid column_id="1" symbols="1,2,1" />
            <SymbolGrid column_id="2" symbols="1,0,1" />
    </Response > */

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

/* 
import scaleToWindow from 'scale-to-window-pixi';
// in case you need ssr, it's good to wrap your window objects in some method

window.addEventListener("resize", function (event) {
    scaleToWindow(eleDict, getWindow, getDocument, backgroundColor);
}); */