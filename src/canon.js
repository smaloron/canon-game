//----- Objet Canon
function Canon(element){
    this.rotation = 0;
    this.power = 50;
    this.graphic = element;
    this.rotationControl = $("input[name='rotation']");

    this.minRotation = -80;
    this.maxRotation = 0;
    this.rotationStep = -1;


    this.getRotationStep = function (direction){
        var step = 0;
        switch(direction){
            case 'up':
                step = this.rotationStep;
                break;
            case 'down':
                step = Math.abs(this.rotationStep);
                break;
        }

        return step;
    };

    this.rotate = function(direction){
        var step = this.getRotationStep(direction);

        var newRotation = this.rotation + step;
        if(newRotation <= this.maxRotation && newRotation>= this.minRotation){
            this.rotation = newRotation;
            this.graphic.css({'-webkit-transform' : 'rotate('+ this.rotation +'deg)',
                '-moz-transform' : 'rotate('+ this.rotation +'deg)',
                '-ms-transform' : 'rotate('+ this.rotation +'deg)',
                'transform' : 'rotate('+ this.rotation +'deg)'});
        }

        this.rotationControl.val(Math.abs(this.rotation));
    };

    this.reset = function(){
        this.rotation = 0;
        this.power = 50;

        this.rotate();

    }

    this.setPower = function (amount){
        amout = parseInt(amount,10);
        this.power = amount;
    };


    this.getCenterCoordinate = function(){
        var position = this.graphic.position();
        var left = position.left + (this.graphic.width()/2);
        var top = position.top + (this.graphic.height()/2);

        return {'x': left, 'y': top};
    };

    this.centerCoordinate = this.getCenterCoordinate();


}///Objet Canon


//------- Objet Canonall
function CanonBall(element){
    this.coordinate = {'x':0, 'y':0};
    this.angle = 0;
    this.power = 0;
    this.graphic = element;
    this.gravity = 0.05;
    this.baseGravity = 0.05;
    this.powerDecay = .5;

    this.width = parseInt(this.graphic.css('width'),10);

    this.degreeToRadian = function(degree){
        return degree * (Math.PI / 180);
    };

    this.setStartingPosition = function(canon){
        var position = canon.centerCoordinate;

        this.graphic.css('left', position.x - this.width/2 +'px');
        this.graphic.css('top', position.y - this.width/2  +'px');
    };

    this.move = function(){
        var power = this.power/5;
        var xOffset = power * Math.cos(this.angle);
        var yOffset = power * Math.sin(this.angle);
        var position = this.graphic.position();

        var posX = position.left + xOffset;
        var posY = position.top - yOffset +  this.gravity;

        this.graphic.css('left', posX +'px');
        this.graphic.css('top', posY  +'px');

        this.coordinate.x = posX;
        this.coordinate.y = posY;

        console.log(this.coordinate);

        this.gravity += 0.05;

        //this.power = Math.max(1, this.power - this.powerDecay);
    };

    this.isOutOfBound = function ($scene){
        var outOfBound =    this.coordinate.x > $scene.width() - (this.width)
                        ||  this.coordinate.x < 0
                        ||  this.coordinate.y > $scene.height() - (this.width)
                        ||  this.coordinate.y < 0
                        ;

        return outOfBound;
    };

    this.hasHittenTarget = function($target){
        var position = $target.position();
        var hitten =    this.coordinate.x > (position.left /*- ($target.width()/2)*/) - this.width
                        &&  this.coordinate.y > (position.top /*- ($target.height()/2)*/) - this.width
            ;
        return hitten;
    }

    this.reset = function(){
        this.angle = 0;
        this.power = 0;
        this.coordinate.x = 0;
        this.coordinate.y = 0;
        this.gravity = this.baseGravity;

        this.graphic.css('left', '0px');
        this.graphic.css('bottom', '0px');
        this.graphic.hide();
    };
}///Objet CanonBall

function Target(element){

}


$(function(){

    //---- Globales
    var $debug = $('#debug');
    var $canonElement = $('.canon');
    var $canonBallElement = $('.ball');
    var $scene = $('#scene');
    var $target = $('#target');
    var $win = $('.win');

    var score = 0;

    var canon = new Canon($canonElement);
    var ball = new CanonBall($canonBallElement);

    var $powerControl = $("input[name='power']");
    var canonBallIsFlying = false;
    var gameLoop;
    //-------------------------------------------


    //------- Intitalisation du jeu
    function init(keepCanonSettings){
        if(! keepCanonSettings){
            $("input[name='rotation']").val(0);
            $powerControl.val(50);
            canon.reset();
        }

        canonBallIsFlying = false;
        ball.reset();
        $win.hide();
    }/// initialisation

    init(false);


    //--------- Gestion des évènements clavier
    $(window).keydown (function(event){
        $debug.html(event.which);
        var keyCode = event.which;
        switch(keyCode){
            //élévation du canon touches haut bas
            case 38:
                canon.rotate('up');
                break;
            case 40:
                canon.rotate('down');
                break;
            //Tir du canon barre d'espace
            case 32:
                //On ne peut pas tirer si un boulet est encore en vol
                if(!canonBallIsFlying){
                    $win.hide();
                    canonBallIsFlying = true;
                    ball.graphic.show();
                    ball.setStartingPosition(canon);
                    ball.angle = ball.degreeToRadian(Math.abs(canon.rotation));
                    ball.power = canon.power;

                    gameLoop = setInterval(gameEngine, 50);
                }
                break;

        }
    }); ///evenements clavier

    //----------- Gestion du controle de puissance
    $powerControl.change(function(){
        console.log('controle : ' + $powerControl.val());
        canon.setPower($powerControl.val());
        console.log('Canon : ' + canon.power);
    });///controle puissance

    //********** Boucle du jeux ********************************



    function gameEngine(){

        if(canonBallIsFlying){

            ball.move();

            if(ball.hasHittenTarget($target)){
                init(false);
                $win.show();
                score++;
                clearInterval(gameLoop);

            } else if(ball.isOutOfBound($scene) ){
                init(true);
                clearInterval(gameLoop);
            }
        }
    }///Boucle du jeu
});///onready