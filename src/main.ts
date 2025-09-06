import Phaser from "phaser";
import { WIDTH, HEIGHT } from "./helpers";

const TILE = 20;
const COLS = Math.floor(WIDTH / TILE);
const ROWS = Math.floor(HEIGHT / TILE);

class SnakeScene extends Phaser.Scene {
  dir = { x: 1, y: 0 };
  snake: { x:number, y:number }[] = [{x:5,y:5},{x:4,y:5},{x:3,y:5}];
  food = { x: 10, y: 8 };
  acc = 0;
  step = 0.12; // seconds per move

  create(){
    this.cameras.main.setBackgroundColor("#0b0d10");
    this.input.keyboard.on("keydown", (e: KeyboardEvent)=>{
      if (e.key === "ArrowUp" && this.dir.y === 0) this.dir = {x:0,y:-1};
      if (e.key === "ArrowDown" && this.dir.y === 0) this.dir = {x:0,y:1};
      if (e.key === "ArrowLeft" && this.dir.x === 0) this.dir = {x:-1,y:0};
      if (e.key === "ArrowRight" && this.dir.x === 0) this.dir = {x:1,y:0};
    });
  }

  update(_t:number, dtMs:number){
    this.acc += dtMs/1000;
    if (this.acc < this.step) return;
    this.acc = 0;

    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS){
      this.scene.restart(); return;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y){
      this.food = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) };
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw(){
    this.add.rectangle(0,0,WIDTH,HEIGHT,0x0b0d10).setOrigin(0,0);
    // draw food
    this.add.rectangle(this.food.x*TILE, this.food.y*TILE, TILE, TILE, 0xff4444).setOrigin(0,0);
    // draw snake
    for (const s of this.snake){
      this.add.rectangle(s.x*TILE, s.y*TILE, TILE, TILE, 0x66cc66).setOrigin(0,0);
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH, height: HEIGHT,
  parent: "game",
  backgroundColor: "#0b0d10",
  scene: [SnakeScene]
});
