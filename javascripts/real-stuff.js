/*******************************************************/
var MovieRequest = React.createClass({
  handleSubmit: function(event) {
    event.preventDefault();

    // Really want to store this in state instead
    // TODO: I'll pretty much have to do that when I add the
    // <Enter> handler to the text box
    var name = $("#name").val();
    if(name.length != 0) {
      this.props.reset_state(name);
      console.log("Querying for ", name);
      $.ajax({
        url: "http://omdbapi.com",
        data: {s: name},
        type: "GET",
        dataType: "json",

        success: function(json) {
          if(this.isMounted()) {
            var movies = json["Search"];
            if(movies) {
              console.log("Updating movie list with", movies);
              this.props.update_base_list(movies);
              console.log("State change scheduled");
            }
            else {
              console.log("No results found");
            }
          }
          else {
            console.warn("Component unmounted before result returned");
          }
        }.bind(this),
        error: function(xhr, status, err) {
          // Of course, by the time we get here, the state name could
          // definitely have changes
          console.error("Fetching failed:", this.state.name, status, err);
        }.bind(this)
      });
    } else {
      console.log("Nothing to query for");
    }
  },

  getInitialState: function() {
    return {"name": ""};
  },

  render: function() {
    // TODO: should also submit if <Enter> is pressed when name has focus
    return (
      <div className="row">
        <div className="large-12 columns">
          <div key="submission-form">
            <div className="large-4 columns">
              <input type="text" id="name" placeholder="Movie Name" />
            </div>
            <div className="large-2 columns end">
              <a className="button round" onClick={this.handleSubmit}>Search</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

/**************************************************/
var MovieOverview = React.createClass({
  render: function() {
    console.log("Overview:", this.props.movie);
    return(
      <div className="panel row">
          <div className="large-1 columns">{this.props.movie.title}</div>
          <div className="large-1 columns">-</div>
          <div className="large-1 columns">{this.props.movie.year}</div>
      </div>
    );
  }
});

/**************************************************/
var MovieDetail = React.createClass({
  render: function() {
    console.log("Details:", this.props.movie);
    var href = this.props.movie.Website;
    var image;
    if(href && href != "N/A") {
      image = (<a href={href} className="th">
                <img alt={this.props.movie.tomatoConsensus} src="frank-james.jpg" />
              </a>);
    } else {
      image = <img alt={this.props.movie.tomatoConsensus} src="frank-james.jpg" />;
    }

    // FIXME: The img tag should really be using CSS
    //console.warn("Go back to using 'real' src for img");
    // i.e. use {this.props.movie.Poster} and quit worrying about bandwidth
    return(
      <div className="panel">
        <div className="row">
          <div className="large-3 columns">
            <div className="large-1 columns">{this.props.movie.Title}</div>
            <div className="large-1 columns">-</div>
            <div className="large-1 columns">{this.props.movie.Released}</div>
          </div>
          <div className="large-4 columns">
            {this.props.movie.Plot}
          </div>
          <div className="large-5 columns">
            <div>
              {image}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

/*****************************************************/
var MovieDetailList = React.createClass({
  render: function() {
    // TODO: This desperately needs sorting options
    var movieNodes = this.props.data.map(function(movie) {
      if(movie.Plot) {
        return(<MovieDetail key={movie.imdbID} movie={movie} />);
      } else {
        return (
          <MovieOverview key={movie.imdbID} movie={movie} />
          );
      }
    });
    // FIXME: Can I use ul class="block-grid three-up mobile-six-up"
    // and then individual li's instead?
    return (
      <div id="details" key={this.props.searchString} className="row">
        {movieNodes}
      </div>
    );
  }
});

/*******************************************************/
var Movies = React.createClass({
  resetState: function(searchString) {
      var state = this.getInitialState();
      state.lastSearch = searchString
      this.replaceState(state);
  },
  updateBaseList: function(movies) {
    console.log("Have movies. Scheduling state change through ", this);
    
    var description = {};
    for(var n in movies) {
      var movie = movies[n];
      console.log("Adding to base state:", movie);
      var title = movie["Title"];
      var key = movie["imdbID"];
      description[key] = {"title": title,
                          "key": key,
                          "year": movie["Year"]
                         };
      // console.log("Querying for details about ", title);
      $.ajax({
        url: "http://omdbapi.com",
        data: {i: key,
               tomatoes: true},
        dataType: "json",
        success: function(details) {
          console.log("Detail Received:", details);
          if(this.isMounted()) {
            var key2 = details["imdbID"];
            // This isn't creating a separate closure for each callback handler
            // It shouldn't matter, but it's a sad thing to learn
            /*if(key != key2) {
              console.error("Querying for " + key + " returned " + key2);
            }*/
            var current = this.state.movies;
            current[key2] = details;
            this.setState({"movies": current});
          } else {
            console.log("Component unmounted from underneath us");
          }
        }.bind(this),
        error: function(xhr, status, err) {
          console.error("Retrieving Details Failed", xhr, status, err);
        }.bind(this)
      });
    };
    console.log("Getting ready to change the state to", description);
    this.setState({"movies": description});
  },

  getInitialState: function() {
    return {lastSearch: "",
            movies: {}};
  },

  render: function() {
    movies = [];
    if(this.state){
      console.log("Rendering:", this.state);
      for(var key in this.state.movies) {
        movie = this.state.movies[key];
        movie.key = key
        movies.push(movie);
      };
    }
    return(
      <div>
        <MovieRequest key="request-form" update_base_list={this.updateBaseList} reset_state={this.resetState} />
        <MovieDetailList data={movies} />
      </div>
    );
  }
});

React.render(
  <Movies />,
  document.getElementById("container")
);
