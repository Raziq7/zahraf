(function ($) {
 "use strict";

$('#my-menu').mmenu();

$(".vm-menu").on('click', function(){
	$(".vm-dropdown").slideToggle();
});

$(".minicart-icon").on('click', function(){
	$(".cart-dropdown").slideToggle();
});

if ($(window).width() < 992) {
	$(".vm-dropdown li").on('click', function() {
		$(this).toggleClass('open');
	});
}
/*---------------------
  menu-stick
--------------------- */
var s = $(".sticker");
var pos = s.position();					   
$(window).on('scroll',function() {
	var windowpos = $(window).scrollTop();
	if (windowpos > pos.top) {
	s.addClass("stick");
	} else {
		s.removeClass("stick");	
	}
});
/*--------------------------
 scrollUp
---------------------------- */	
$.scrollUp({
	scrollText: '<i class="fa fa-angle-up"></i>',
	easingType: 'linear',
	scrollSpeed: 900,
	animation: 'slide'
}); 

/*-------------------------------------
    Hero Slider
----------------------------------------*/
var mainSlider = $('.main-slider');
mainSlider.slick({
	arrows: false,
	prevArrow:"<button type='button' class='slick-prev'><i class='fa fa-angle-left'></i></button>",
	nextArrow:"<button type='button' class='slick-next'><i class='fa fa-angle-right'></i></button>",
	autoplay: true,
	autoplaySpeed: 5000,
	dots: true,
	pauseOnFocus: false,
	pauseOnHover: false,
	fade: true,
	infinite: true,
	slidesToShow: 1,
	responsive: [
		{
		  breakpoint: 767,
		  settings: {
			  arrows: false
		  }
		},
		{
			breakpoint: 479,
			settings: {
				arrows: false
			}
		}
	]
});
mainSlider.on('beforeChange', function(event, slick, currentSlide, nextSlide){
	var sliderTitle = $('.main-slider h2');
	var currentTitle = $('.slick-current h2');
	sliderTitle.removeClass('cssanimation leDoorCloseLeft sequence');
	currentTitle.addClass('cssanimation leDoorCloseLeft sequence');
});
mainSlider.on('afterChange', function(event, slick, currentSlide, nextSlide){
	var sliderTitle = $('.main-slider h2');
	var currentTitle = $('.slick-current h2');
	sliderTitle.removeClass('cssanimation leDoorCloseLeft sequence');
	currentTitle.addClass('cssanimation leDoorCloseLeft sequence');
});
/*--------------------------
 product category carousel
---------------------------- */
$(".product-categories-carousel").slick({
  dots: false,
  infinite: true,
  speed: 300,
  slidesToShow: 6,
  adaptiveHeight: true,
  prevArrow: '<i class="fa fa-angle-left"></i>',
  nextArrow: '<i class="fa fa-angle-right"></i>',
	responsive: [
		{
			breakpoint: 361,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		},
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3
			}
		},
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3
			}
		},
		{
			breakpoint: 1400,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 4
			}
		},
	]
});
/*--------------------------
 product category 2
---------------------------- */
$(".five-catItems").slick({
  dots: false,
  infinite: true,
  speed: 300,
  slidesToShow: 5,
  adaptiveHeight: true,
  prevArrow: '<i class="fa fa-angle-left"></i>',
  nextArrow: '<i class="fa fa-angle-right"></i>',
  responsive: [
    {
      breakpoint: 1400,
      settings: {
        slidesToShow: 4,
      }
    },
    {
      breakpoint: 769,
      settings: {
        slidesToShow: 2,
      }
    },
    {
      breakpoint: 361,
      settings: {
        slidesToShow: 1,
      }
    }
  ]
});
/*--------------------------
 one-carousel
---------------------------- */
$(".one-carousel").slick({
	dots: true,
	list:false,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 1,
	adaptiveHeight: true,
	arrows:true,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
});
/*--------------------------
 product-deals
---------------------------- */
$(".product-deals").slick({
	dots: false,
	list:false,
	autoplay: true,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 1,
	slidesToScroll: 1,
	adaptiveHeight: true,
	arrows:false,
	responsive: [
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 481,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}
	]
});
/*--------------------------
 product-carousel
---------------------------- */
$(".product-carousel").slick({
	dots: true,
	list:false,
	autoplay: true,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 5,
	slidesToScroll: 5,
	adaptiveHeight: true,
	arrows:false,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
	responsive: [
		{
			breakpoint: 361,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		},
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3
			}
		},
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3
			}
		},
		{
			breakpoint: 1400,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 4
			}
		},
	]
});
/*--------------------------
 product-carousel
---------------------------- */
$(".products-three").slick({
	dots: true,
	list:false,
	autoplay: false,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 4,
	slidesToScroll: 4,
	adaptiveHeight: true,
	arrows:false,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
	responsive: [
		{
			breakpoint: 1400,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3
			}
		},
		{
			breakpoint: 993,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 361,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}
	]
});
/*--------------------------
 four-items
---------------------------- */
$(".four-items").slick({
	dots: true,
	list:false,
	autoplay: false,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 4,
	slidesToScroll: 4,
	adaptiveHeight: true,
	arrows:false,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
	responsive: [
		{
			breakpoint: 993,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3,
			}
		},
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 361,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}
	]
});
/*--------------------------
 best-seller-carousel
---------------------------- */
$(".best-seller").slick({
	dots: true,
	list:false,
	autoplay: false,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 5,
	slidesToScroll: 5,
	adaptiveHeight: true,
	arrows:false,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
	responsive: [
		{
			breakpoint: 361,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		},
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3
			}
		},
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3
			}
		},
		{
			breakpoint: 1400,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 4
			}
		},
	]
});
/*--------------------------
 product-carousel-full-width
---------------------------- */
$(".product-carousel-fullwidth").slick({
	dots: true,
	list:false,
	autoplay: false,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 6,
	slidesToScroll: 6,
	adaptiveHeight: true,
	arrows:false,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
	responsive: [
		{
			breakpoint: 1400,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 4,
			}
		},
		{
			breakpoint: 993,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3,
			}
		},
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 361,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}
	]
});
/*--------------------------
 blog-carousel
---------------------------- */
$(".blog-carousels").slick({
	dots: false,
	list:false,
	autoplay: false,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 1,
	slidesToScroll: 1,
	adaptiveHeight: true,
	arrows:true,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
	responsive: [
		{
			breakpoint: 993,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3,
			}
		},
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 481,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}
	]
});
/*--------------------------
 recent-products
---------------------------- */
$(".recent-products").slick({
	dots: false,
	list:false,
	autoplay: false,
	autoplaySpeed: 5000,
	infinite: true,
	speed: 700,
	slidesToShow: 3,
	slidesToScroll: 3,
	adaptiveHeight: true,
	arrows:true,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
	responsive: [
		{
			breakpoint: 769,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
			}
		},
		{
			breakpoint: 361,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		}
	]
});
/*--------------------------
brand carousel
---------------------------- */
$(".brand-items").slick({
	dots: false,
	infinite: true,
	speed: 300,
	slidesToShow: 8,
	slidesToScroll: 1,
	adaptiveHeight: true,
	autoplay: true,
	responsive: [
		{
			breakpoint: 1400,
			settings: {
				slidesToShow: 5,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 4,
			}
		},
		{
			breakpoint: 481,
			settings: {
				slidesToShow: 2,
			}
		}
	],
	arrows:false,
	prevArrow: '<i class="fa fa-angle-left"></i>',
	nextArrow: '<i class="fa fa-angle-right"></i>',
});

/*---------------------
countdown
--------------------- */
$('[data-countdown]').each(function() {
	
	var $this = $(this), finalDate = $(this).data('countdown');
	
	$this.countdown(finalDate, function(event) {
	$this.html(event.strftime('<span class="cdown days"><span class="time-count">%-D</span><p>Days</p></span> <span class="cdown hour"><span class="time-count">%-H</span> <p>Hour</p></span> <span class="cdown minutes"><span class="time-count">%M</span> <p>Min</p></span> <span class="cdown second"> <span><span class="time-count">%S</span> <p>Sec</p></span>'));
	});
	
});

/*----------------------------
 price-slider
------------------------------ */  
$( "#slider-range" ).slider({
	range: true,
	min: 40,
	max: 600,
	values: [ 60, 570 ],
	slide: function( event, ui ) {
	$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
	}
});
$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
" - $" + $( "#slider-range" ).slider( "values", 1 ) );
/*----------------------------
 cart-plus-minus-button
------------------------------ */  
$(".qtybutton").on("click", function() {
	var $button = $(this);
	var oldValue = $button.parent().find("input").val();

	if ($button.text() == "+") {
	  var newVal = parseFloat(oldValue) + 1;
	} else {
	   // Don't allow decrementing below zero
	  if (oldValue > 0) {
		var newVal = parseFloat(oldValue) - 1;
		} else {
		newVal = 0;
	  }
	  }
	$button.parent().find("input").val(newVal);
});
/*--------------------------
 venobox
---------------------------- */	
$(document).ready(function(){
    $('.venobox').venobox();
});



})(jQuery); 