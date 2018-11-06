const $ = require('jquery');
/**
 * es6 modules and imports
 */
import sayHello from './hello';
sayHello('World');

/**
 * require style imports
 */
const {getMovies} = require('./api.js');

// Populates movies
const populateMovies = () => {
    getMovies().then((movies) => {
        $('#codeup').removeClass('hide');
        $('div, form, nav').removeClass('hide');
        $('h1, td, h5, option').remove();
        $('#newMovieGenre').append(
            `<option>Action</option>
            <option>Adventure</option>
            <option>Comedy</option>
            <option>Crime & Gangster</option>
            <option>Drama</option>
            <option>Family</option>
            <option>Epics/Historical</option>
            <option>Horror</option>
            <option>Musicals / Dance</option>
            <option>Science Fiction</option>
            <option>War</option>
            <option>Westerns</option>`);
        movies.forEach(({title, rating, id, genre}) => {
            $(`#ID${id}`).remove();
            $('table').append(`<tbody class="item" id=movie${id}></tbody>`);
            $(`#movie${id}`).append( // cleaned up and consolidated the below
                `<td><h5>${title}</h5></td>
                 <td ><h5 class="rating">${rating}</h5></td>
                 <td><h5>${genre}</h5></td>
                 <td><button class="btn-floating btn-large waves-effect waves-light red">
                 <i class="small material-icons" id='ID${id}'>delete_forever</i></button></td>`
            );

            // allows for editing of movies
            $('#moviesToEdit').append(`<option>${title}</option>`);
            $(`#ID${id}`).click(function(e) {
                // Delete movies
                e.preventDefault();
                const deleteMovieTitle = {title,rating,id};
                $.getJSON(`https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=${title}&callback=?`, function(json) {
                    if (json != "Nothing found.") {
                        console.log(json.results[0].poster_path);
                        $('#moviePoster').css('background-image', `url('http://image.tmdb.org/t/p/w500${json.results[0].poster_path}')`)
                    }})
                const url = `./api/movies/${id}`;
                const options = {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(deleteMovieTitle),
                };
                fetch(url, options)
                    .then(data => {
                        console.log(data);
                        populateMovies();
                        $(`#ID${id}`).remove()
                    })
                    .catch();
            });
        });
    }).catch((error) => {
        alert(`Oh no! Something went wrong.
                Check the console for details.`);
        console.log(error);
    });
};
populateMovies();

// Edits movies
$('#selectMovieToEdit').click(function (e) {
    e.preventDefault(e);
    $('#movieToEditTitle').val('');
    $('#movieToEditRating').val('');
    getMovies().then((movies => {
        let movieToEdit = $('#moviesToEdit').val();
        let selectedMovie = movies.filter(movie => {
            return [`${movieToEdit}`].includes(movie.title)
        });
        $.getJSON(`https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=${selectedMovie[0].title}&callback=?`, function(json) {
            if (json != "Nothing found.") {
                console.log(json.results[0].poster_path);
                $('#moviePoster').css('background-image', `url('http://image.tmdb.org/t/p/w500${json.results[0].poster_path}')`)
            }})
        $('#movieToEditTitle').removeAttr('hidden').val(selectedMovie[0].title);
        $('#movieToEditRating').removeAttr('hidden').val(selectedMovie[0].rating);
        console.log(selectedMovie[0].genre);
        $('#movieToEditGenre').removeClass('hide');
        $('#movieToEditGenre').append(
            `<option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Comedy">Comedy</option>
            <option value="Crime & Gangster">Crime & Gangster</option>
            <option value="Drama">Drama</option>
            <option value="Family">Family</option>
            <option value="Epics/Historical">Epics/Historical</option>
            <option value="Horror">Horror</option>
            <option value="Musicals / Dance">Musicals / Dance</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="War">War</option>
            <option value="Westerns">Westerns</option>`);
        $("#movieToEditGenre option").each(function(){
            if (($(this).text()).toLowerCase() == selectedMovie[0].genre)
                $(this).attr("selected","selected");
        });
        $('#submitMovieToEdit').removeClass('hide');
        $('#submitMovieToEdit').click(function () {
            const url = `./api/movies/${selectedMovie[0].id}`;
            let updatedMovie = {title: $('#movieToEditTitle').val(), rating: $('#movieToEditRating').val(), genre: ($('#movieToEditGenre').val()).toLowerCase()};
            let options = {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedMovie)};
            fetch(url, options)
                .then(data => {
                    console.log(data);
                    $('#movieToEditTitle').attr('hidden',true);
                    $('#movieToEditRating').attr('hidden',true);
                    $('#movieToEditGenre').addClass('hide',true);
                    $('#submitMovieToEdit').addClass('hide',true);
                    populateMovies();
                    $('#submitMovieToEdit').off();
                })
                .catch();
        });
    }))});

// Removes the disabled button after the certain criteria is met
$('body').keyup(function () {
    if ($('#newMovieTitle').val()  !== '' &&
        $('#newMovieRating').val() !== '' &&
        $('#newMovieRating').val() < 6 ){
        $('#addMovie').removeAttr('disabled');
    }else {
        $('#addMovie').attr('disabled','disabled');
    }
});

// Adds movies
$('#addMovie').click(function (e) {
    e.preventDefault();
    const newMovieTitle = $('#newMovieTitle').val();
  const newMovieRating = $('#newMovieRating').val();
    const newMovieGenre = ($('#newMovieGenre').val()).toLowerCase();
    $.getJSON(`https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=${newMovieTitle}&callback=?`, function(json) {
        if (json != "Nothing found.") {
            console.log(json.results[0].poster_path);
            $('#moviePoster').css('background-image', `url('http://image.tmdb.org/t/p/w500${json.results[0].poster_path}')`)
        }});
    const newMovie = {title: newMovieTitle, rating: newMovieRating, genre: newMovieGenre};
    const url = './api/movies';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMovie),
    };
    fetch(url, options)
        .then(data => {
            console.log(data);
            populateMovies();
            $('#newMovieTitle').val('');
            $('#newMovieRating').val('');
            $('#newMovieGenre').val('');
            $('#addMovie').attr('disabled','disabled');
        })
        .catch();
});

$('#searchTitle').click(()=>{
    $('.searchMovie').toggleClass('hide').val('');
    searchMovieTitle();
    $('.searchGenre').addClass('hide').val('');
    $('.searchRating').addClass('hide').val('')
});

$('#searchGenres').click(()=>{
    $('.searchGenre').toggleClass('hide').val('');
    searchMovieGenre();
    $('.searchRating').addClass('hide')
    $('.searchMovie').addClass('hide')
});

$('#searchRatings').click(()=>{
    $('.searchRating').toggleClass('hide').val();
    searchMovieRating();
    $('.searchGenre').addClass('hide');
    $('.searchMovie').addClass('hide');
});

$('#dotOne').fadeOut().fadeIn();

setTimeout(() => {
    $('#dotTwo').fadeOut().fadeIn();
}, 500);

setTimeout(() => {
    $('#dotThree').fadeOut().fadeIn();
}, 750);



