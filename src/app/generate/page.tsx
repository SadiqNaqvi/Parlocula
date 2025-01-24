"use client";
import "@/styles/generate.css";
import { useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { useUsersChoice } from "@/store/store";

interface movieObject {
  mood: string;
  genre: string[];
  year: string;
  adult: boolean;
  actor: string;
}

const initialState: movieObject = {
  mood: "",
  genre: [],
  year: "",
  adult: true,
  actor: "",
};

const reducer = (state: movieObject, action: any) => {
  switch (action.type) {
    case "moodSelection": {
      return {
        ...state,
        mood: action.val,
      };
    }
    case "genreSelection": {
      state.genre.length > 2 && state.genre.shift();
      return {
        ...state,
        genre: [...state.genre, action.val],
      };
    }
    case "genreUnselection": {
      return {
        ...state,
        genre: state.genre.filter((el) => el !== action.val),
      };
    }
    case "releaseYear": {
      return {
        ...state,
        year: action.val,
      };
    }
    case "actor": {
      return {
        ...state,
        actor: action.val,
      };
    }
  }
};

export default function Generate() {

  const { updateChoice }: any = useUsersChoice();

  const [sectionNumber, setSectionNumber] = useState(0);

  const [state, dispatch] = useReducer<
    (state: movieObject, action: any) => any
  >(reducer, initialState);

  const router = useRouter();

  const moodArray = [{ emoji: "😊", label: "happy" }, { emoji: "😐", label: "neutral" }, { emoji: "😟", label: "sad" }];
  const genreArray = ["Action", "Adventure", "Comedy", "Sitcom", "Romance", "Drama", "Biopic", "Teen", "Horror", "Slasher", "Crime", "Detective fiction", "Suspence", "Thriller", "Psychological Thriller", "Fantasy", "Medieval Fantasy", "Supernatural fiction", "Apocalyptic Fiction", "Science fiction", "Dystopian fiction", "Death Game", "Historical", "Cyberpunk"];
  const yearArray = ["Doesn't matter.", "Released this year.", "Released in the past 5 years.", "Released in the past 10 years.", "Released in the past 15 years.", "Released in the past 20 years.", "Released in the past 30 years or older."]

  const saveUsersChoice = () => {
    updateChoice(state);
    router.push("/result");
  }

  const goNext = () => setSectionNumber((prev) => prev + 1);

  const StartSection = () => {
    return (
      <section id="getStarted" className="inputSections ">
        <h2 className="text-4xl text-center">
          Answer some simple questions to help our AI find <br /> a perfect movie/show for
          you.
        </h2>
        <button className="primary mt-10" onClick={goNext}>
          Get Started
        </button>
      </section>
    );
  };

  const MoodSection = () => {
    return (
      <section id="mood" className="inputSections">
        <h2>Mood:</h2>
        <p>How are you feeling today?</p>
        <div className="inputCont">
          {moodArray.map((el) => (
            <button
              key={el.label}
              className={`p-5 aspect-square mx-2 text-6xl ${state.mood.emoji === el.emoji ? "active" : ""
                }`}
              onClick={() => dispatch({ type: "moodSelection", val: el })}
            >
              {el.emoji}
            </button>
          ))}
        </div>
        {state.mood ? (
          <button className="primary" onClick={goNext}>
            Next
          </button>
        ) : (
          <button className="disable">Next</button>
        )}
      </section>
    );
  };

  const GenreSection = () => {
    return (
      <section id="genre" className="inputSections">
        <h2>Genre:</h2>
        <p>It is recommend to choose 2 genres.</p>
        <div className="inputCont px-5 flex flex-wrap gap-3 justify-center">
          {genreArray.map((el) => (
            <button
              key={el}
              className={`basis-[14%] border-gray-500 ${state.genre?.includes(el) ? "active" : ""
                }`}
              onClick={() =>
                dispatch({
                  type: state.genre.includes(el)
                    ? "genreUnselection"
                    : "genreSelection",
                  val: el,
                })
              }
            >
              {el}
            </button>
          ))}
        </div>
        {state.genre.length ? (
          <button className="primary block mx-auto" onClick={goNext}>
            Next
          </button>
        ) : (
          <button className="disable block mx-auto">Next</button>
        )}
      </section>
    );
  };

  const YearSection = () => {
    return (
      <section id="releaseYear" className="inputSections">
        <h2>Release Year:</h2>
        <p>How old the movie/show should be?</p>
        <ul className="inputCont">
          {yearArray.map((el) => (
            <li
              className={`listOptions ${state.year === el ? "active" : ""}`}
              key={el}
              onClick={() => dispatch({ type: "releaseYear", val: el })}
            >
              {el}
            </li>
          ))}
        </ul>
        {state.year ? (
          <button className="primary block mx-auto" onClick={goNext}>
            Next
          </button>
        ) : (
          <button className="disable block mx-auto">Next</button>
        )}
      </section>
    );
  };

  return (
    <>
      {sectionNumber === 0 ? (
        <StartSection />
      ) : sectionNumber === 1 ? (
        <MoodSection />
      ) : sectionNumber === 2 ? (
        <GenreSection />
      ) : sectionNumber === 3 ? (
        <YearSection />
      ) : sectionNumber === 4 && (
        <section id="actorName" className="inputSections">
          <h2>Actor/Actress (optional)</h2>
          <p>Do you want a specific Actor/Actress to be in the movie/show?</p>
          <input
            type="text"
            value={state.actor}
            className="my-10 w-80"
            placeholder="Name of the actor/actress"
            onChange={(e) => dispatch({ type: "actor", val: e.target.value })}
          />
          <button
            id="submit"
            className="primary"
            onClick={saveUsersChoice}
          >
            Suggest
          </button>
        </section>
      )
      }
    </>
  );
}
