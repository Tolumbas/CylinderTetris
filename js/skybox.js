// небесен куб - конструктор
		Skybox = function(center,size)
		{	
			// върхове
			var v = [ [+0.5,-0.5,-0.5], [+0.5,+0.5,-0.5],
					  [-0.5,+0.5,-0.5], [-0.5,-0.5,-0.5],
					  [+0.5,-0.5,+0.5], [+0.5,+0.5,+0.5],
					  [-0.5,+0.5,+0.5], [-0.5,-0.5,+0.5] ];
			// общ списък на съвпадащи координати на връх и тексел
			var data = [].concat(
					  v[0], v[1], v[4], // предна стена
					  v[4], v[1], v[5],
					  v[6], v[2], v[7], // задна стена
					  v[7], v[2], v[3], 
					  v[5], v[1], v[6], // дясна стена 
					  v[6], v[1], v[2], 
					  v[4], v[7], v[0], // лява стена 
					  v[0], v[7], v[3], 
					  v[4], v[5], v[7], // горна стена
					  v[7], v[5], v[6], 
					  v[0], v[3], v[1], // долна стена 
					  v[1], v[3], v[2] );
			var buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER,buf);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
			this.buf = buf;
			this.center = center;
			this.size = size;
			this.texture = undefined; // неизвестна текстура
		}

		// небесен куб - метод за рисуване
		Skybox.prototype.draw = function()
		{	
			pushMatrix();
				translate(this.center);
				scale([2*this.size,2*this.size,this.size]);
				xRotate(-90);
				useMatrix();
				
				gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);
				gl.enableVertexAttribArray(aXYZ);
				gl.vertexAttribPointer(aXYZ,3,gl.FLOAT,false,3*FLOATS,0*FLOATS);
				// казваме къде са текстурите, ако всичките 6 са вече заредени
				if (gl.isTexture(this.texture) && !this.texture.count)
				{
					gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.texture);
					gl.drawArrays(gl.TRIANGLES,0,36);
				}
			popMatrix();
		}

		
		
		// създаване на празна кубична текстура
		function texture3D()
		{
			var texture = gl.createTexture();
			texture.count = 6;
			return texture;
		}
		
		// заявка за зареждане на една от 6-те текстури на кубична подтекстура
		function loadTexture3D(texture,side,url)
		{
			var image = new Image();
			image.onload = function()
			{
				imageLoaded3D(texture,image,side);
			};
			image.src = url;
		}
			
		// функция, която се извиква при зареждането на кубична текстура
		function imageLoaded3D(texture,image,side)
		{
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
			gl.texImage2D(side, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
			texture.count--;
			if (texture.count==0)
			{
				gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			}
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
		}
