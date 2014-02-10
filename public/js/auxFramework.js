Background = function(bImage, w) {
	this.width = w;
	this.x = 0;
	this.y = 0;
	var bg = new Image();
	bg.src = bImage;
	
	this.Draw = function(ctx) {
		ctx.drawImage(bg, this.x, this.y);
	};
};

Meteor = function(x, y, w, h, imgIn, vec2) {
	this.rect = new Rectangle(x, y, w, h)
	
	this.SetPosition = function(x, y) {
		this.rect.x = x;
		this.rect.y = y;
	}
};

Pickup = function(x, y, h, w) {
	this.rect = new Rectangle(x, y, h, w);
	this.image = new Image();
	
	this.SetProperties = function(type) {
		if (type == "star")
			this.image.src = "images/star.png";
		
		if (type == "heart")
			this.image.src = "images/heart.png";
			
		if (type == "ship")
			this.image.src = "images/ship.png"
	}
	
	this.Draw = function(ctx) {
		ctx.drawImage(this.image, this.rect.x, this.rect.y);
	}
	
	this.SetPosition = function(x, y) {
		this.rect.x = x;
		this.rect.y = y;
	}
};

Backdrop = function(x, y, w, h, imgIn) {
	this.rect = new Rectangle(x, y, w, h)
	this.image = imgIn;
	
	this.SetPosition = function(x, y) {
		this.rect.x = x;
		this.rect.y = y;
	};
	
	this.Draw = function(ctx) {
		ctx.drawImage(this.image, this.rect.x, this.rect.y);
	}
	
	this.changeImg = function(imgIn) {
		this.image = imgIn;
	}
};

Audio.prototype.fadeIn = function() {
	this.fps = 0;
	if (this.fps >= 60 && this.volume <= 1.0) {
		this.volume += 0.1;
	} else {
		this.fps++
	}
	
	for(i = 0; i < 600; i++) {
		if (i % 60 == 0)
			this.volume += 0.1;

	}
};
/*
Sound = function(sndSrc, vol) {
	this.fps = 0;
	this = new Audio(sndSrc);
	this.volume = vol;
	
	this.fadeIn = function() {
		if(this.fps > 60) {
			this.volume += 0.1;
		} else {
			this.fps++
		}
	}
};*/