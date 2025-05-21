import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { switchChain } from "../redux/slices/chain";
import { CHAIN_CONFIGS } from "../config/chainConfigs";

const ChainSwitcher = () => {
    const dispatch = useDispatch();
    const selectedChain = useSelector((state) => state.chain.selectedChain);

    const handleChange = (event) => {
        dispatch(switchChain(event.target.value));
    };

    return (
   
        <div className="col-md-6 manu">
            <button>
            <label htmlFor="chain-select">Select Chain:</label>
            <select value={selectedChain} onChange={handleChange}>
                {Object.entries(CHAIN_CONFIGS).map(([key]) => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                ))}
            </select>
            </button>
        </div>
    );
};

export default ChainSwitcher;
