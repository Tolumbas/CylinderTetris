var canonicBrick;
var startX = 0;
var startY = 0;
var viewA = -0.14 ;
var viewB = 0.32;
var viewD = 50;
var board;
var gameOver = false;
var pause = false;
var old = Date.now();
var time = Date.now();
class Game {
	constructor(){
		this.board = [];
		this.activePiece = this.getNext();
		this.points = 0;
		for(let i=0;i<20;i++){
		this.board.push([]);
		for(let j=0;j<10;j++){
			this.board[i].push(-1);
			}
		}
		this.pieces = [new BrickPiece([0,1,1]),new BrickPiece([1,1,0]),new BrickPiece([1,0,1]),new BrickPiece([0,0,1]),new BrickPiece([1,0.55,0]),new BrickPiece([1,0,0]),new BrickPiece([0.25,1,0.1])];
	}
	getNext(){
		let r = Math.round(Math.random()*6);
		if(this.lastPiece===undefined){
			this.lastPiece = r;
		}
		else{
			while (this.lastPiece === r){
				r = Math.round(Math.random()*6);
			}
			this.lastPiece = r;
		}
		switch (r) {
				case 0:
					return new TShape([2,0]);
				case 1:
					return new IShape([2,0]);
				case 2:
					return new LShape([2,0]);
				case 3:
					return new JShape([2,0]);
				case 4:
					return new SShape([1,0]);
				case 5:
					return new ZShape([1,0]);
				default:
					return new OShape([1,0]);
		}
	}
	draw(){
		gl.bindTexture(gl.TEXTURE_2D,blockTexture);
		for(let i=0;i<20;i++){
			for(let j = 0; j<10;j++){
				if(this.board[i][j] != -1) this.pieces[this.board[i][j]].draw(i,j);
			}
		}
		if(!gameOver)
		this.activePiece.draw();
		gl.bindTexture(gl.TEXTURE_2D,null);
	}
	place(){
		this.activePiece.put(this.board);
		this.activePiece = this.getNext();
		this.removeFullRows();
		if(!this.check()){
			gameOver = true;
			document.getElementById("gameOver").style.visibility = "visible";
			document.getElementById("helpHint").innerHTML ="(Press R to restart)";
		}
	}
	removeFullRows(){
		let newBoard = this.board.filter(function(value, index, arr){
				for(let i=0;i<value.length;i++){
						if (value[i]==-1) return true;
				}
				return false;
			});
		if(newBoard.length!=this.board.length){
			let diff = this.board.length-newBoard.length;
			for(let i = 0; i<diff;i++){
				newBoard.unshift([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]);
			}
			this.board = newBoard;
			switch(diff){
				case 0:
				return;
				case 1:
					this.update(40);
					break;
				case 2:
					this.update(100);
					break;
				case 3:
					this.update(300);
					break;
				case 4:
					this.update(1200);
					break;					
			}
		}
	}
	check(rotation,down,side){
		if(!this.activePiece.checkValidCoordinates((down?1:false),(rotation?rotation:false))) return false;
		let coordinates = this.activePiece.getAllCoordinates((rotation?true:false),(this.activePiece.rotation+rotation)%4);
		let sideways = side?(side==1?9:1):0;
		for(let i=0;i<4;i++){
			if(this.board[coordinates[i][0] + (down?1:0)][((coordinates[i][1]+sideways)%10)]!=-1){
				return false;
			}
		}
		return true;
	}
	update(points){
		this.points+=points;
		scoreboard.innerHTML = "Score:" + this.points;
	}
	hardDrop(){
		let points = 1;
		while(this.check(false,1,false)){
			this.activePiece.moveDown();
			points++;
		}
		this.update(points);
		this.place();
	}
	moveDown(){
		if(this.check(false,1,false))
			this.activePiece.moveDown();
	}
	moveLeft(){
		if(this.check(false,false,1))
			this.activePiece.moveSide(1);
	}
	moveRight(){
		if(this.check(false,false,2))
			this.activePiece.moveSide(0);
	}
	rotate(left){
		if(this.check((left?1:3)))
			this.activePiece.rotate(left);
	}
	passTurn(){
		if(this.check(false,1,false)){
			this.moveDown();
		}
		else{
			this.place();
		}
	}
}
class CanonicalBrickPiece {
	constructor(){
		let v = [];
		let bigR = 2;
		let smallR = 1.4;
		let degree = Math.PI/180;
		let textureCoords = [];
		for(let i=18;i>=-18;i-=2){
			v.push([bigR*Math.cos(degree*i),bigR*Math.sin(degree*i),0]);
			v.push([bigR*Math.cos(degree*i),bigR*Math.sin(degree*i),1]);
		}
		for(let i=18;i>=-18;i-=2){
			v.push([smallR*Math.cos(degree*i),smallR*Math.sin(degree*i),0]);
			v.push([smallR*Math.cos(degree*i),smallR*Math.sin(degree*i),1]);
		}
		for(let i=0;i<=18;i++){
			textureCoords.push(i/18.0);
		}
		let normals = [ [0,0,1],[0,0,-1],[-Math.sin(18*degree),Math.cos(18*degree),0],[Math.sin(-18*degree),-Math.cos(-18*degree),0]];
		let data = [];
		
		
		//FRONT SIDE;
		for(let i=0;i<v.length/2;i++){
			let normal = i%2==0?unitVector(v[i]):unitVector(v[i-1]);
			data.push(v[i][0],v[i][1],v[i][2],normal[0],normal[1],normal[2],textureCoords[Math.floor(i/2)],(i%2==0?0:1));
		}
		data.push(	v[v.length/2-2][0],v[v.length/2-2][1],v[v.length/2-2][2],normals[3][0],normals[3][1],normals[3][2],0,0,
					v[v.length/2-1][0],v[v.length/2-1][1],v[v.length/2-1][2],normals[3][0],normals[3][1],normals[3][2],0,1,
					v[v.length-2][0],v[v.length-2][1],v[v.length-2][2],normals[3][0],normals[3][1],normals[3][2],1,0,
					v[v.length-1][0],v[v.length-1][1],v[v.length-1][2],normals[3][0],normals[3][1],normals[3][2],1,1);
		//BACK SIDE;
		for(let i=v.length-1,j=36;i>=v.length/2;i--,j--){
			let normal = i%2==0?unitVector(v[i]):unitVector(v[i-1]);
			normal = [-normal[0],-normal[1],-normal[2]];
			data.push(v[i][0],v[i][1],v[i][2],normal[0],normal[1],normal[2],textureCoords[Math.floor((j+1)/2)],(i%2==0?0:1));
		}
		data.push(	v[v.length/2+1][0],v[v.length/2+1][1],v[v.length/2+1][2],normals[2][0],normals[2][1],normals[2][2],0,0,
					v[v.length/2][0],v[v.length/2][1],v[v.length/2][2],normals[2][0],normals[2][1],normals[2][2],0,1,
					v[1][0],v[1][1],v[1][2],normals[2][0],normals[2][1],normals[2][2],1,0,
					v[0][0],v[0][1],v[0][2],normals[2][0],normals[2][1],normals[2][2],1,1);
		//TOP SIDE;			
		for(let i=0;i<v.length/2;i+=2){
			data.push(v[i][0],v[i][1],v[i][2],normals[1][0],normals[1][1],normals[1][2],1,textureCoords[Math.floor(i/2)]);
			data.push(v[v.length/2+i][0],v[v.length/2+i][1],v[v.length/2+i][2],normals[1][0],normals[1][1],normals[1][2],0,textureCoords[Math.floor(i/2)]);
		}
		//BOTTOM SIDE;
		for(let i=v.length/2-1;i>=0;i-=2){
			data.push(v[i][0],v[i][1],v[i][2],normals[0][0],normals[0][1],normals[0][2],1,textureCoords[Math.floor(i/2)]);
			data.push(v[v.length/2+i][0],v[v.length/2+i][1],v[v.length/2+i][2],normals[0][0],normals[0][1],normals[0][2],0,textureCoords[Math.floor(i/2)]);
		}
		
		let buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		this.buf = buf;
		this.size = data.length/8;
		}
		
	draw(texture){
		gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
		gl.enableVertexAttribArray(aXYZ);
		gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,8*FLOATS,0*FLOATS);
		gl.enableVertexAttribArray(aNormal);
		gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,8*FLOATS,3*FLOATS);
		gl.enableVertexAttribArray(aST);
		gl.vertexAttribPointer(aST,2,gl.FLOAT,false,8*FLOATS,6*FLOATS);
		gl.drawArrays(gl.TRIANGLE_STRIP,0,this.size);
	}
}

class BrickPiece{
	constructor (color) {
		this.color = color;
		if(!canonicBrick) canonicBrick = new CanonicalBrickPiece();
	}
	draw(level,position){
		pushMatrix();
			scale([1,1,0.85]);
			if(position) zRotate(position*36);
			if(level) translate([0,0,-20+level]);
			useMatrix();
			gl.vertexAttrib3fv(aColor,this.color);
			canonicBrick.draw();
		popMatrix();
	}
}

// coordinates = [0] - row, [1] - column
class Shape{
	constructor(coordinates){
		this.coordinates = coordinates;
		this.rotation = 0;
	}
	rotate(left){
		this.rotation = (this.rotation+(left?1:3))%4;
	}
	draw(){
		let coordinates = this.getAllCoordinates();
		for(let i=0;i<4;i++)
			this.piece.draw(coordinates[i][0],coordinates[i][1]);
	}
	put(board){
		let coordinates = this.getAllCoordinates();
		for(let i=0;i<4;i++){
			board[coordinates[i][0]][coordinates[i][1]%10] = this.pieceId;
		}
	}
	moveDown(){
		this.coordinates[0]++;
		this.coordinates[0]%=20;
	}
	moveSide(left){
		if(left) this.coordinates[1]+=9;
		else this.coordinates[1]++;
		this.coordinates[1]=this.coordinates[1]%10;
	}
	logCoordinates(){
		console.log("Current coordinates: row -" + coordinates[0] + "; col -" + coordinates[1]);
	}
	checkValidCoordinates(down,rotation){
		let coords = this.coordinates[0];
		let rot = this.rotation;
		if(down){
			coords += down;
		}
		if(rotation){
			rot+= rotation;
			rot= rot%4;
		}
		return this.checkValidity(rot,coords);
	}
}
class IShape extends Shape{
	constructor(coordinates){
		super(coordinates);
		this.piece = new BrickPiece([0,1,1]);
		this.pieceId = 0;
	}
	getAllCoordinates(override,rotation){
		let rot = override?rotation:this.rotation;
		let coordinates = [];
		if(rot%2 != 0){
			coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10]);
			coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
			coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
			coordinates.push([this.coordinates[0]+2,this.coordinates[1]%10]);
		}
		else{
			coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
			coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
			coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
			coordinates.push([this.coordinates[0],(this.coordinates[1]+2)%10]);
		}
		return coordinates;
	}
	checkValidity(rot,coords){
			if(rot%2!=0) return coords>0&&coords<18;
			else return coords>0&&coords<=19;
	}
}
class OShape extends Shape{
	constructor(coordinates){
		super(coordinates);
		this.piece = new BrickPiece([1,1,0]);
		this.pieceId = 1;
	}
	getAllCoordinates(override,rotation){
		let rot = rotation?rotation:this.rotation;
		let coordinates = []
		coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
		coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+1)%10]);
		coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
		coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
		return coordinates;
	}
	checkValidity(rot,coords){
			return coords>0&&coords<19;
	}
}
class TShape extends Shape {
	constructor(coordinates){
		super(coordinates);
		this.piece = new BrickPiece([1,0,1]);
		this.pieceId = 2;
	}
	getAllCoordinates(override,rotation){
		let rot = override?rotation:this.rotation;
		let coordinates = [];
		switch(rot){
			case 0:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				break;
			case 1:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10])
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				break;
			case 2:
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				break;
			default:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				break;
		}
		return coordinates;
	}
	checkValidity(rot,coords){
			switch(rot){
			case 0:
				return coords>0&&coords<=19;
			case 1:
				return coords>0&&coords<=18;
			case 2:
				return coords>=0&&coords<=18;
			default:
				return coords>0&&coords<=18;				
			}
	}
}
class JShape extends Shape {
		constructor(coordinates){
			super(coordinates);
			this.piece = new BrickPiece([0,0,1]);
			this.pieceId = 3;
		}
	getAllCoordinates(override,rotation){
		let rot = override?rotation:this.rotation;
		let coordinates = [];
		switch(rot){
			case 0:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+9)%10]);
				break;
			case 1:
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0]-1,(this.coordinates[1]+9)%10]);
				break;
			case 2:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]-1,(this.coordinates[1]+1)%10]);
				break;
			default:
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+1)%10]);
				break;
		}
		return coordinates;
	}
	checkValidity(rot,coords){
			switch(rot){
			case 0:
				return coords>0&&coords<=18;
			case 1:
				return coords>0&&coords<=19;
			case 2:
				return coords>0&&coords<=18;
			default:
				return coords>=0&&coords<=18;				
			}
	}
}
class LShape extends Shape {
			constructor(coordinates){
			super(coordinates);
			this.piece = new BrickPiece([1,0.55,0]);
			this.pieceId = 4;
		}
	getAllCoordinates(override,rotation){
		let coordinates = [];
		let rot = override?rotation:this.rotation;
		switch(rot){
			case 0:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+1)%10]);
				break;
			case 1:
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+9)%10]);
				break;
			case 2:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10])
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]-1,(this.coordinates[1]+9)%10]);
				break;
			default:
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]-1,(this.coordinates[1]+1)%10]);
				break;
		}
		return coordinates;
	}
	checkValidity(rot,coords){
			switch(rot){
			case 0:
				return coords>0&&coords<=18;
			case 1:
				return coords>=0&&coords<=18;
			case 2:
				return coords>0&&coords<=18;
			default:
				return coords>0&&coords<=19;				
			}
	}
}
class ZShape extends Shape {
			constructor(coordinates){
			super(coordinates);
			this.piece = new BrickPiece([1,0,0]);
			this.pieceId = 5;
		}
	getAllCoordinates(override,rotation){
		let rot = override?rotation:this.rotation;
		let coordinates = [];
		switch(rot){
			case 0: 
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+1)%10]);
				break;
			case 1:
				coordinates.push([this.coordinates[0],this.coordinates[1]%10])
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0]-1,(this.coordinates[1]+1)%10]);
				break;
			case 2:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10])
				coordinates.push([this.coordinates[0]-1,(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				break;
			default:
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+9)%10]);
				break;
		}
		return coordinates;
	}
	checkValidity(rot,coords){
		switch(rot){
		case 0:
			return coords>=0&&coords<=18;
		case 1:
			return coords>0&&coords<=18;
		case 2:
			return coords>0&&coords<=19;
		default:
			return coords>0&&coords<=18;				
		}
	}
}
class SShape extends Shape {
			constructor(coordinates){
			super(coordinates);
			this.piece = new BrickPiece([0.25,1,0.1]);
			this.pieceId = 6;
		}
	getAllCoordinates(override,rotation){
		let rot = override?rotation:this.rotation;
		let coordinates = [];
		switch(rot){
			case 0: 
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+9)%10]);
				break;
			case 1:
				coordinates.push([this.coordinates[0],this.coordinates[1]%10])
				coordinates.push([this.coordinates[0]+1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				coordinates.push([this.coordinates[0]-1,(this.coordinates[1]+9)%10]);
				break;
			case 2:
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10])
				coordinates.push([this.coordinates[0]-1,(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+9)%10]);
				break;
			default:
				coordinates.push([this.coordinates[0],this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0],(this.coordinates[1]+1)%10]);
				coordinates.push([this.coordinates[0]-1,this.coordinates[1]%10]);
				coordinates.push([this.coordinates[0]+1,(this.coordinates[1]+1)%10]);
				break;
		}
		return coordinates;
	}
		checkValidity(rot,coords){
		switch(rot){
		case 0:
			return coords>=0&&coords<=18;
		case 1:
			return coords>0&&coords<=18;
		case 2:
			return coords>0&&coords<=19;
		default:
			return coords>0&&coords<=18;				
		}
	}
}