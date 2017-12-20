
function init(){

    createDB();
    getMoviesListAndDrawList();
    var favbutt = $('.favlistbutton');
    favbutt.click(getFavs);

}



function getMovieAndDrawDetail(idmovie){


     var request = $.ajax({
          url: "https://api.themoviedb.org/3/movie/"+idmovie+"?api_key=93d910e44d19bd207e49085cd8141d0f",
          method: "GET"
        });

        request.done(function( themovie ) {

          $(".movietitle").empty().append(themovie.original_title);
          $("#overview").empty().append("<strong>Overview: </strong>"+themovie.overview);

          $("#image").empty().append("<img src=\"https://image.tmdb.org/t/p/w92" + themovie.poster_path + "\">");

          $("#genres").empty().append("<strong>Genre(s): </strong>");
          for (i=0;i<themovie.genres.length;i++){
          $("#genres").append(themovie.genres[i].name);
            if (i!=themovie.genres.length-1){$("#genres").append(", "); }
          }

            $("#runtime").empty().append("<strong>Runtime: </strong>"+themovie.runtime+" min");


         if(isFav(themovie.id)){

               $("#addfav").empty().append("<button id=\"favbutton\" onclick=\"javascript:deleteFav("+themovie.id+")\" class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-delete\">Delete from favorites</button>");
            }
           else {

               $("#addfav").empty().append("<button id=\"favbutton\" onclick='javascript:insertFav("+themovie.id+")' class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-star\">Add to favorites</button>");

                }


        });

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });

    location.hash = "ficha";
}


function getMoviesListAndDrawList(){
    var theList = $("#mylist");
    
     var request = $.ajax({
          url: "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=93d910e44d19bd207e49085cd8141d0f",
          method: "GET"
        });

        request.done(function( moviesList ) {


            
            for (i=0;i<moviesList.results.length;i++){
            var id = moviesList.results[i].id;
                  theList.append( "<li> <a onclick=\"javascript:getMovieAndDrawDetail("+id+")\" id=\""+moviesList.results[i].id+"\" data-transition=\"pop\" ><img src=\"https://image.tmdb.org/t/p/w92" + moviesList.results[i].poster_path + "\"><h4>" + moviesList.results[i].original_title + " </h4><p>"+ moviesList.results[i].overview+"</p><p><strong>Release date: </strong>"+ moviesList.results[i].release_date.toString()+"</p></a></li>");

                }
            theList.listview("refresh");
            
            });
    
        
    
    

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
}




///////////// DATABASE:  ///////////////////

function createDB(){

     db = window.sqlitePlugin.openDatabase({name: 'favorites.db', location: 'default'});

     db.sqlBatch([
    'CREATE TABLE IF NOT EXISTS favorites (id,original_title,overview,poster)',
     ], function() {
    console.log('Created database OK');
  }, function(error) {
    console.log('SQL batch ERROR: ' + error.message);
  });

}

function getFavs(){

 location.hash = "favs";

var theList = $("#favlist");
 theList.empty().append(
                       '<li class="ui-block-solo" style="text-align:center; color:grey;">'+
                           '<h3>Loading ...</h3>'+
                       '<li>'
                   );


     db.executeSql('SELECT * FROM favorites', [], function(rs) {

         if (rs.rows.length == 0){
              theList.empty().append(
                                    '<li class="ui-block-solo" style="text-align:center; color:grey;">'+
                                        '<h3>There is not favorites yet</h3>'+
                                    '<li>'
                                );
             theList.listview("refresh");
         }
       else{
           theList.empty();
           for(i=0;i<rs.rows.length;i++){
                theList.append( "<li> <a onclick=\"javascript:getMovieAndDrawDetail("+rs.rows.item(i).id+")\" data-transition=\"pop\" ><img src=\"https://image.tmdb.org/t/p/w92" + rs.rows.item(i).poster + "\"><h4>" + rs.rows.item(i).original_title + " </h4><p>"+rs.rows.item(i).overview+" "+rs.rows.item(i).id+"</p></a></li>");

           }
           theList.listview("refresh");
       }
     }, function(error) {
       console.log('SELECT SQL statement ERROR: ' + error.message);
     });
}


function isFav(id){
var isFav=false;

db.executeSql('SELECT COUNT * FROM favorites WHERE id=?', [id], function(res) {

               if(res.rows!=0){
                isFav =true;

                                $("#addfav").empty().append("<button id=\"favbutton\" onclick=\"javascript:deleteFav("+themovie.id+")\" class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-delete\">Delete from favorites</button>");

                             }

                             else{
                                $("#addfav").empty().append("<button id=\"favbutton\" onclick='javascript:insertFav("+themovie.id+")' class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-star\">Add to favorites</button>");

                             }



      }, function(error) {
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });


}



function insertFav(id){

     var title;
     var overview;
     var poster;


     var request = $.ajax({
              url: "https://api.themoviedb.org/3/movie/"+id+"?api_key=93d910e44d19bd207e49085cd8141d0f",
              method: "GET"
            });

            request.done(function( movie ) {

            title = movie.original_title;
            overview = movie.overview;
            poster = movie.poster_path;

             db.executeSql('INSERT INTO favorites VALUES (?,?,?,?)', [id,title,overview,poster], function(rs) {
                     $("#addfav").empty().append("<button id=\"favbutton\" onclick=\"javascript:deleteFav("+id+")\" class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-delete\">Delete from favorites</button>");

              }, function(error) {
                  alert(" no insertado! haha" + error.message);

                console.log('SELECT SQL statement ERROR: ' + error.message);
              });




                });



            request.fail(function( jqXHR, textStatus ) {
              alert( "Request failed: " + textStatus );
        });




}

function deleteFav(id){

 db.executeSql('SELECT * FROM favorites WHERE id=?', [id], function(res) {

                    var themovie = res.rows.item(0);  //guardamos la fila de la peli en la DB para ponerle las columnas en el onClick despues del delete

                    db.executeSql('DELETE FROM favorites WHERE id=?', [id], function(rs) {
                         console.log(id + "will be deleted");
                            console.log('rowsDeleted: ' + rs.rowsAffected);
                               alert('rowsDeleted: ' + rs.rowsAffected);
                            $("#addfav").empty().append("<button id=\"favbutton\" onclick='javascript:insertFav("+themovie.id+")' class=\"ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-star\">Add to favorites</button>");

                    }, function(error) {
                            console.log('Delete SQL statement ERROR: ' + error.message);
                        });
      }, function(error) {
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });


}
