import { createSlice } from "@reduxjs/toolkit";
import { CHAIN_CONFIGS } from "../../config/chainConfigs";

const initialChain = "bscTestnet";
const initialState = {
    selectedChain: initialChain,
    chainDetails: CHAIN_CONFIGS[initialChain],
};

const chain = createSlice({
    name: "chain",
    initialState,
    reducers: {
        switchChain: (state, action) => {
            state.selectedChain = action.payload;
            state.chainDetails = CHAIN_CONFIGS[action.payload];
        },
    },
});

export const { switchChain } = chain.actions;
export default chain.reducer;
