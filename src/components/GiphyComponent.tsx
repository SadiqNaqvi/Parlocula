import {
    Grid, // our UI Component to display the results
    SearchBar, // the search bar the user will type into
    SearchContext, // the context that wraps and connects our components
    SearchContextManager, // the context manager, includes the Context.Provider
    SuggestionBar, // an optional UI component that displays trending searches and channel / username results
} from '@giphy/react-components'
import { useContext } from 'react'

// the search experience consists of the manager and its child components that use SearchContext
const SearchExperience = ({ callback }: any) => (
    <SearchContextManager apiKey={process.env.NEXT_PUBLIC_GIPHY_KEY as string}>
        <Components callback={callback} />
    </SearchContextManager>
)

// define the components in a separate function so we can
// use the context hook. You could also use the render props pattern
const Components = ({ callback }: any) => {
    const { fetchGifs, searchKey, } = useContext(SearchContext)
    return (
        <div
            className="bg-primary p-2 rounded-md border border-gray40 h-3/4 w-full max-w-lg"
            onClick={e => e.stopPropagation()}>
            <SearchBar className='mb-3' searchDebounce={1000} />
            <SuggestionBar />
            {/**
                key will recreate the component,
                this is important for when you change fetchGifs
                e.g. changing from search term dogs to cats or type gifs to stickers
                you want to restart the gifs from the beginning and changing a component's key does that
            **/}
            <Grid
                key={searchKey}
                noLink
                className="overflow-y-auto w-full max-w-lg h-96 rounded-md mt-4"
                onGifClick={callback}
                columns={3}
                hideAttribution
                width={400}
                fetchGifs={fetchGifs}
            />
            <div className="mt-2 py-1">
                <p className="text-center text-xs text-zinc-500">Powered by GIPHY</p>
            </div>
        </div>
    )
}

export default SearchExperience;