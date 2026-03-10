import { GifResult } from '@giphy/js-fetch-api';
import { Grid, SearchBar, SearchContext, SearchContextManager } from '@giphy/react-components';
import useOfflineStore from '@store/offlineStore';
import { TypedFunction } from '@type/other';
import { useContext } from 'react';

type GifResultData = GifResult["data"];

const Components = ({ callback }: { callback: TypedFunction<GifResultData> }) => {
    const { fetchGifs, searchKey, } = useContext(SearchContext);
    const [lastUsed, setLastUsed] = useOfflineStore<GifResultData[]>("lastUsedGifs", []);

    const onGifsClick = (gif: GifResultData) => {
        let temp = [...lastUsed];

        if (lastUsed.some(g => g.id !== gif.id)) {
            temp = temp.filter(g => g.id !== gif.id);
        }

        if (temp.length >= 10) {
            temp.pop();
        }

        setLastUsed([gif, ...temp]);
        callback(gif);
    }

    return (
        <div
            className="px-2"
        // onClick={e => e.stopPropagation()}
        >
            <SearchBar className='mb-3' searchDebounce={1000} />
            <Grid
                key={searchKey}
                noLink
                className="overflow-y-auto w-full max-w-lg h-96 rounded-md mt-4"
                percentWidth='100%'
                width={200}
                layoutType='MIXED'
                onGifClick={onGifsClick}
                initialGifs={lastUsed}
                columns={3}
                hideAttribution
                fetchGifs={fetchGifs}
            />
            <div className="mt-2 py-1">
                <p className="text-center text-xs text-zinc-500">Powered by GIPHY</p>
            </div>
        </div>
    )
}

const SearchExperience = ({ callback }: { callback: TypedFunction<GifResultData> }) => (
    <SearchContextManager apiKey={process.env.NEXT_PUBLIC_GIPHY_KEY!}>
        <Components callback={callback} />
    </SearchContextManager>
)

export default SearchExperience;