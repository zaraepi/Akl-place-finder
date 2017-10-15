$(function() {
    $('select').niceSelect();

});



// Initiate map
const version = '?v=20170901';
const clientid = '&client_id=AVN22MT2XHHXNHVBHGQMTYOKYCBQOJQMLF1GJOU30N1JDEXH';
const clientSecret = '&client_secret=GU0EDF0V2GPP2GXLCEQMYP1ILA3PG3CPRXCJP23SLMYFU41G';
const key = version + clientid + clientSecret;

// Lines of code to get breakpoint
let breakpoint = {};
breakpoint.refreshValue = function() {
    this.value = window.getComputedStyle(document.querySelector('body'), ':before')
        .getPropertyValue('content').replace(/\"/g, '');
}
$(window).resize(function() {
    breakpoint.refreshValue();
}).resize();

// Pseudo-constructor for divs
$('#search-options').data('isOpen', false);
$('#search-details').data('isOpen', false);


let cafeGroup = L.layerGroup();
let dessertGroup = L.layerGroup();
let restaurantGroup = L.layerGroup();
let barGroup = L.layerGroup();
let scenicGroup = L.layerGroup();


//template7
let detailsHTML = $('#details-template').text();
let detailsTemplate = Template7(detailsHTML).compile();


//template7
let venueHTML = $('#venue-template').text();
let venueTemplate = Template7(venueHTML).compile();


let center = [-36.8446152873055, 174.76662397384644];
//let center = [-36.846984961341974,174.76600170135498];
let map = L.map('map', {
    zoomControl: false
}).setView(center, 15);


let multiScenicGroup = L.layerGroup().addTo(map);
let multiCircleGroup = L.layerGroup().addTo(map);

let infoMarker;

let circle = L.circle(center, {
    radius: 800,
    color: 'salmon',
    weight: 1,
    fill: false
}).addTo(map);
//L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWJldGxvZ2FuIiwiYSI6ImNqNmFhNWw0czEwcWUycG55Z3h3YzFyMGYifQ.txrUggxbLPIanNvZxtaAYQ').addTo(map);
L.tileLayer('https://api.mapbox.com/styles/v1/zaraepi/cj6n0dfpu0asq2smionk3kzm0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiemFyYWVwaSIsImEiOiJjajZsZ3M5engxczd6MzNyeXVhcmNra2w4In0.uCJg22qFz1JtGhWtOy_6DQ').addTo(map);

function getVenues(center) {

    cafeGroup.clearLayers();
    dessertGroup.clearLayers();
    restaurantGroup.clearLayers();
    barGroup.clearLayers();
    scenicGroup.clearLayers();


    map.removeLayer(circle);

    circle = L.circle(center, {
        radius: 800,
        color: 'salmon',
        weight: 0.6,
        fill: false
    }).addTo(map);
    //Explore venues -- foursquare api
    //let exploreUrl = 'https://api.foursquare.com/v2/venues/explore'+key+'&ll=-36.849046,174.765305';
    let exploreUrl = 'https://api.foursquare.com/v2/venues/explore' + key + '&ll=' + center[0] + ',' + center[1];
    $.ajax({
        url: exploreUrl,
        dataType: 'jsonp',
        success: function(res) {
            let data = res.response.groups[0].items;
            console.log(data);

            let venues = _(data).map(function(item) {
                console.log(item.venue.categories["0"].name);

                return {
                    latlng: [item.venue.location.lat, item.venue.location.lng],
                    description: item.venue.name,
                    iconImage: getIcon(item.venue.categories[0].shortName),
                    venueid: item.venue.id,
                    category: item.venue.categories[0].shortName
                };
            });
            _(venues).each(function(venue) {
                let venueIcon = L.icon({
                    iconUrl: venue.iconImage,
                    iconSize: [25, 25]
                });
                let marker = L.marker(venue.latlng, {
                    icon: venueIcon
                });

                if ((venue.category.indexOf('Café') > -1) || (venue.category.indexOf('Coffee') > -1) ||
                    (venue.category.indexOf('Bakery') > -1)) {
                    marker.addTo(cafeGroup);
                    marker.iconLink = 'svg/button/cafe-slim.svg';
                    //added this instead of creating new function to insert image next to the mydiv icon
                } else if ((venue.category.indexOf('Desserts') > -1) || (venue.category.indexOf('Ice Cream') > -1) ||
                    (venue.category.indexOf('Ice Cream Shop') > -1) || (venue.category.indexOf('Chocolate') > -1) ||
                    (venue.category.indexOf('Chocolates') > -1)) {
                    marker.addTo(dessertGroup);
                    marker.iconLink = 'svg/button/dessert-slim.svg';
                } else if ((venue.category.indexOf('Restaurant') > -1) || (venue.category.indexOf('Steak') > -1) ||
                    (venue.category.indexOf('Food') > -1) || (venue.category.indexOf('Japanese') > -1) ||
                    (venue.category.indexOf('Burgers') > -1) || (venue.category.indexOf('Mexican') > -1) ||
                    (venue.category.indexOf('Pizza') > -1) || (venue.category.indexOf('Vietnamese') > -1) ||
                    (venue.category.indexOf('Australian') > -1) ||
                    (venue.category.indexOf('Middle Eastern') > -1) ||
                    (venue.category.indexOf('Seafood') > -1)) {
                    marker.addTo(restaurantGroup);
                    marker.iconLink = 'svg/button/restaurant-B.svg';
                } else if ((venue.category.indexOf('Reserve') > -1) || (venue.category.indexOf('Scenic Lookout') > -1) ||
                    (venue.category.indexOf('Winery') > -1) || (venue.category.indexOf('Vineyard') > -1) ||
                    (venue.category.indexOf('Aquarium') > -1) || (venue.category.indexOf('Park') > -1)) {
                    marker.addTo(scenicGroup);
                    marker.iconLink = 'svg/button/camera-C.svg';

                } else if ((venue.category.indexOf('Bar') > -1) ||
                    (venue.category.indexOf('Brewery') > -1)) {
                    marker.addTo(barGroup);
                    marker.iconLink = 'svg/button/bar-C.svg';
                }

                marker.venueid = venue.venueid;
                marker.on('click', function(e) {
                    console.log(venue.category);
                    let venueUrl = 'https://api.foursquare.com/v2/venues/' + this.venueid + key;
                    let marker = this; //added this and stands for marker inside the marker+iconLink
                    $.ajax({
                        url: venueUrl,
                        dataType: 'jsonp',
                        success: function(res) {
                            let venue = res.response.venue;


                            //let iconHTML = '<div><img class="marker-button" src="'+marker.iconLink+'">' + res.response.venue.name + '</div>';
                            let iconHTML = '<div><img class="marker-button" src="' + marker.iconLink + '"><div class="name"> ' + res.response.venue.name + ' </div></div>';
                            var myIcon = L.divIcon({
                                className: 'my-div-icon',
                                html: iconHTML,
                                iconSize: [100, 100]
                            });

                            if (infoMarker) {
                                map.removeLayer(infoMarker);

                            }
                            infoMarker = L.marker([res.response.venue.location.lat, res.response.venue.location.lng], {
                                icon: myIcon
                            }).addTo(map);

                            console.log(venue);


                            let photos = res.response.venue.photos.groups[0];
                            console.log(photos);


                            $('#search-details').empty();
                            console.log(venue);

                            let output = detailsTemplate(venue);

                            $(output).appendTo('#search-details');
                        }
                    });

                    toggleSearchDetails();
                    setTimeout(function() {
                        map.invalidateSize(true);
                        map.setView(e.target.getLatLng(), 17); //original is 17
                    }, 500);

                });
            });
        }
    });

}


function getMultiVenues(center) {

    let circle = L.circle(center, {
        radius: 800,
        color: 'salmon',
        weight: 0.5,
        fill: false
    }).addTo(multiCircleGroup);
    //Explore venues -- foursquare api
    //let exploreUrl = 'https://api.foursquare.com/v2/venues/explore'+key+'&ll=-36.849046,174.765305';
    let exploreUrl = 'https://api.foursquare.com/v2/venues/explore' + key + '&ll=' + center[0] + ',' + center[1];
    $.ajax({
        url: exploreUrl,
        dataType: 'jsonp',
        success: function(res) {
            let data = res.response.groups[0].items;
            console.log(data);

            let venues = _(data).map(function(item) {
                console.log(item.venue.categories["0"].name);

                return {
                    latlng: [item.venue.location.lat, item.venue.location.lng],
                    description: item.venue.name,
                    iconImage: getIcon(item.venue.categories[0].shortName),
                    venueid: item.venue.id,
                    category: item.venue.categories[0].shortName
                };
            });
            _(venues).each(function(venue) {
                let venueIcon = L.icon({
                    iconUrl: venue.iconImage,
                    iconSize: [25, 25]
                });
                let marker = L.marker(venue.latlng, {
                    icon: venueIcon
                });

                if ((venue.category.indexOf('Café') > -1) || (venue.category.indexOf('Coffee') > -1) ||
                    (venue.category.indexOf('Bakery') > -1)) {

                } else if ((venue.category.indexOf('Desserts') > -1) || (venue.category.indexOf('Ice Cream') > -1) ||
                    (venue.category.indexOf('Ice Cream Shop') > -1) || (venue.category.indexOf('Chocolate') > -1) ||
                    (venue.category.indexOf('Chocolates') > -1)) {

                } else if ((venue.category.indexOf('Restaurant') > -1) || (venue.category.indexOf('Steak') > -1) ||
                    (venue.category.indexOf('Food') > -1) || (venue.category.indexOf('Japanese') > -1) ||
                    (venue.category.indexOf('Burgers') > -1) || (venue.category.indexOf('Mexican') > -1) ||
                    (venue.category.indexOf('Pizza') > -1) || (venue.category.indexOf('Vietnamese') > -1) ||
                    (venue.category.indexOf('Australian') > -1) ||
                    (venue.category.indexOf('Middle Eastern') > -1) ||
                    (venue.category.indexOf('Seafood') > -1)) {

                } else if ((venue.category.indexOf('Reserve') > -1) || (venue.category.indexOf('Scenic Lookout') > -1) ||
                    (venue.category.indexOf('Winery') > -1) || (venue.category.indexOf('Vineyard') > -1) ||
                    (venue.category.indexOf('Aquarium') > -1) || (venue.category.indexOf('Park') > -1)) {
                    marker.addTo(multiScenicGroup);
                    marker.iconLink = 'svg/button/camera-C.svg';

                } else if ((venue.category.indexOf('Bar') > -1) ||
                    (venue.category.indexOf('Brewery') > -1)) {

                }

                marker.venueid = venue.venueid;
                marker.on('click', function(e) {
                    console.log(venue.category);
                    let venueUrl = 'https://api.foursquare.com/v2/venues/' + this.venueid + key;
                    $.ajax({
                        url: venueUrl,
                        dataType: 'jsonp',
                        success: function(res) {
                            let venue = res.response.venue;

                            //let iconHTML = '<div>' + res.response.venue.name + '</div>';
                            let iconHTML = '<div><img class="marker-button" src="' + marker.iconLink + '"><div class="name"> ' + res.response.venue.name + ' </div></div>';
                            var myIcon = L.divIcon({
                                className: 'my-div-icon',
                                html: iconHTML,
                                iconSize: [100, 50]
                            });

                            if (infoMarker) {
                                map.removeLayer(infoMarker);
                            }
                            infoMarker = L.marker([res.response.venue.location.lat, res.response.venue.location.lng], {
                                icon: myIcon
                            }).addTo(map);


                            //console.log(venue);

                            let photos = res.response.venue.photos.groups[0];
                            //console.log(photos);

                            $('#search-details').empty();
                            console.log(venue);

                            let output = detailsTemplate(venue);

                            $(output).appendTo('#search-details');
                        }
                    });

                    toggleSearchDetails();
                    setTimeout(function() {
                        map.invalidateSize(true);
                        map.setView(e.target.getLatLng(), 17);
                    }, 500);

                });
            });
        }
    });

}

function clearMultiVenues() {
    multiScenicGroup.clearLayers();
    multiCircleGroup.clearLayers();


}
//getVenues([-36.849046,174.765305]);
//getVenues([-36.848984961341974,174.76600170135498]);
getVenues([-36.8446152873055, 174.76662397384644]);




//choose categories buttons
$('.span-btn').hide();
$('.logotype').show();
$('#city-input').on('change', function() {
    $('.span-btn').show();
    if ($('#select-city-input:selected').attr('id') == 'select-city-input') {
        $('.span-btn').hide();
        //$('.logotype').show();

    } else {
        $('.span-btn').show();
        $('.logotype').hide();

    }


    let value = $(this).val();

    var ll = value.split(",");

    map.setView(ll, 15)

    getVenues(ll);

    // console.log(ll);
});

$('#city-input').on('change', function() {
    if ($('#select-city-input:selected').attr('id') == 'select-city-input') {
        $('.span-btn').hide();
        cafeGroup.removeFrom(map);
        dessertGroup.removeFrom(map);
        restaurantGroup.removeFrom(map);
        barGroup.removeFrom(map);
        scenicGroup.removeFrom(map);


    } else {
        $('.span-btn').show();


    }



    let value = $('#city-input').val();
    var ll = value.split(",");
    map.setView(ll, 15)
    getVenues(ll);

});
//end of choose categories locations

// $('.logotype').show();
$('#select-city-input').on('click', function() {
    $('.logotype').hide();

    // if(('.current').data('isOpen')==false){
    //    $('.logotype').hide();
    // }

});


//button-scenic showing all 4 locations at the same time//
$('.btn-scenic').on('click', function() {
    let value = $('#city-input').val();
    if (value == '-36.78368259866044,175.01156330108643') {

        getMultiVenues([-36.78914738997797, 174.99911785125732]);
        getMultiVenues([-36.797979593341225, 175.03478050231934]);
        getMultiVenues([-36.7935464356687, 175.06722450256348]);
        getMultiVenues([-36.81175854581354, 175.0821590423584]);
        map.setZoom(13);
        //map.removeLayer(circle);
        //scenicGroup.removeFrom(map);

    }


});



//organize this to new svg 
function getIcon(category) {
    if (~category.indexOf('Bar') || ~category.indexOf('Brewery')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Café') || ~category.indexOf('Coffee')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Desserts') || ~category.indexOf('Ice Cream') ||
        ~category.indexOf('Chocolates') || ~category.indexOf('Chocolate') ||
        ~category.indexOf('Ice Cream Shop')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Restaurant') || ~category.indexOf('Food')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Japanese')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Burgers')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Mexican')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Steak')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Pizza')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Bakery')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Vietnamese')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Australian')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Reserve') || ~category.indexOf('Scenic Lookout') ||
        ~category.indexOf('Vineyard') || ~category.indexOf('Winery') ||
        ~category.indexOf('Aquarium') || ~category.indexOf('Park')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Middle Eastern')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Seafood')) {
        return 'svg/dot-pointer-blue.svg';
    } else {
        return 'svg/dot-pointer-blue.svg';
    }
}



//add this one (the categories buttons by data-type html)
$('span.btn').on('click', function() {
    let type = $(this).data('type');

    cafeGroup.removeFrom(map);
    dessertGroup.removeFrom(map);
    restaurantGroup.removeFrom(map);
    barGroup.removeFrom(map);
    scenicGroup.removeFrom(map);
    //multiScenicGroup.removeFrom(map);
    map.setZoom(15);
    $('.my-div-icon').hide();


    if (type == 'cafe') {
        cafeGroup.addTo(map);
        cafeGroup.eachLayer(function(layer) {
            //console.log(layer);
        });
    }
    if (type == 'dessert') {
        dessertGroup.addTo(map);
    }
    if (type == 'restaurant') {
        restaurantGroup.addTo(map);
    }
    if (type == 'dessert') {
        dessertGroup.addTo(map);
    }
    if (type == 'scenic') {
        scenicGroup.addTo(map);
        //console.log('bla');
    }
    if (type == 'bar') {
        barGroup.addTo(map);
    }
});

$('#start-search').on('click', function(e) {
    e.preventDefault();
    toggleSearchOptions();
});

$('body').on('click', '.search-close', function(e) {
    e.preventDefault();
    closeSection($(this).parent().parent());
    map.removeLayer(infoMarker);


});



$('#search-button').on('click', function(e) {
    e.preventDefault();
    //toggleSearchOptions();
})

console.log('bla');
console.log(document.querySelector('.search-close'));




// FUNCTIONS
function toggleSearchOptions() {
    $('#search-options').slideToggle(500, 'swing');
    toggleSearchData('#search-options');
    if ($('#search-details').data('isOpen') == true) {
        toggleSearchDetails();
    }
    // $('#map').css('height','calc(100vh-');
}

function closeSection(div) {
    $(div).slideToggle(500, 'swing');
    toggleSearchData($(div));
    if (div[0].id == 'search-details') {
        if (breakpoint.value == 'phone') {
            $('#map').css('height', 'calc(100vh - 58px)');
            setTimeout(function() {
                map.invalidateSize(true);
            }, 500);
        } else if (breakpoint.value == 'tablet') {
            $('#map').css('height', '100vh');
            setTimeout(function() {
                map.invalidateSize(true);
            }, 500);
        }

    }
}

function toggleSearchData(id) {
    if ($(id).data('isOpen') == true) {
        $(id).data('isOpen', false);
    } else {
        $(id).data('isOpen', true);
    }
    // remove after doing testing.
    console.log('open: ' + $(id).data('isOpen'));
}

function toggleSearchDetails() {
    if ($('#search-details').data('isOpen') == false) {
        $('#search-details').slideToggle(500, 'swing');
        toggleSearchData('#search-details');

        if (breakpoint.value == 'phone') {
            $('#map').css('height', 'calc(50vh - 58px)');
        } else if (breakpoint.value == 'tablet') {
            $('#map').css('height', '50vh');
        }
    }
}






// http://leafletjs.com/reference-1.2.0.html#icon

// http://leafletjs.com/examples/custom-icons/