//Code to make map work on the contact page
mapboxgl.accessToken = mapboxToken
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
    center: [19.20583, 49.68917], // starting position [lng, lat]
    zoom: 8 // starting zoom
});


const marker = new mapboxgl.Marker()
    .setLngLat([19.20583, 49.68917])
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML(
                '<h4>This is where you can find us</h4>'
            )
    )
    .addTo(map)