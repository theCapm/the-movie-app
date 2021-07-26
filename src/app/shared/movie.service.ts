import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Movie, MovieBase } from './movie.model';
import { User } from './user.model';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class MovieService implements OnInit, OnDestroy {
    private _movies: Movie[];
    private _ratings: string[] = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'];
    movieSubject = new BehaviorSubject<Movie[]>(null);
    user: User;
    userSub: Subscription;

    constructor(
        private http: HttpClient,
        private userService: UserService,
        private router: Router
    ) {}

    ngOnInit() {
        this.userSub = this.userService.userSubject.subscribe((user) => {
            this.user = user;
        });
    }

    public get movieCount() {
        if (this._movies) {
            return this._movies.length;
        } else {
            return 0;
        }
    }

    public get ratings() {
      console.log(this._ratings);
      return this._ratings;
    }

    showMovies() {
        this.http
            .get('https://codelabs2021.herokuapp.com/api/v1/movies/index', {})
            .subscribe((responseData) => {
                if (responseData['success']) {
                    console.log(responseData);
                    this.handleMoviesResponse(responseData['payload'] as Movie[]);
                } else {
                    console.log(responseData['message']);
                }
            });
    }

    createMovie(movie: MovieBase) {
        this.http
            .post('https://codelabs2021.herokuapp.com/api/v1/movies/create', {
                title: movie.title,
                director: movie.director,
                year: movie.year,
                total_gross: movie.total_gross,
                duration: movie.duration,
                parental_rating: movie.parental_rating
            })
            .subscribe((response) => {
                if (response['success']) {
                    console.log(response);
                    this.router.navigate(['/movies']);
                } else {
                    console.log(response);
                }
            });
    }

    deleteMovie(id: number) {
        this.http
            .request('delete','https://codelabs2021.herokuapp.com/api/v1/movies/destroy', { body: {id: id }})
            .subscribe((response) => {
                if (response['success']) {
                    console.log(response);
                    this.showMovies();
                } else {
                    console.log(response);
                }
            });
    }

    handleMoviesResponse(movies: Movie[]) {
        this._movies = movies;
        this.movieSubject.next(this._movies);
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }
}
