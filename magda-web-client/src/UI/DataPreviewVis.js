import "es6-symbol/implement";
import React, { Component } from "react";
import DataPreviewTable from "./DataPreviewTable";
import DataPreviewChart from "./DataPreviewChart";
import type { ParsedDistribution } from "../helpers/record";

import "./DataPreviewVis.css";

class DataPreviewVis extends Component<{
    distribution: ParsedDistribution
}> {
    constructor(props) {
        super(props);
        this.state = {
            chartType: "line",
            chartTitle: "",
            yAxis: null,
            xAxis: null,
            xScale: "temporal",
            yScale: "quantitative",
            visType: "chart"
        };
        this.onChangeTab = this.onChangeTab.bind(this);
    }

    renderChart() {
        return <DataPreviewChart distribution={this.props.distribution} />;
    }

    renderTable() {
        return <DataPreviewTable distribution={this.props.distribution} />;
    }

    onChangeTab(e) {
        this.setState({
            visType: e.target.value
        });
    }

    /**
     * Return rendered <Tabs> object with tab items
     * @param {Array} tabs - Array of tab items
     */
    renderTabs(tabs) {
        const activeTab = tabs.find(
            (item, i) =>
                item.value.toLowerCase() === this.state.visType.toLowerCase()
        );

        return (
            <nav className="tab-navigation">
                <ul className="au-link-list  au-link-list--inline tab-list">
                    {tabs.map(t => (
                        <li key={t.value}>
                            <button
                                className={`au-link ${
                                    t.value.toLowerCase() === activeTab.value
                                        ? "tab-active"
                                        : null
                                }`}
                                value={t.value.toLowerCase()}
                                onClick={this.onChangeTab}
                            >
                                {t.label}
                            </button>
                        </li>
                    ))}
                </ul>
                {activeTab.action}
            </nav>
        );
    }

    renderByState() {
        const distribution = this.props.distribution;
        if (distribution && distribution.identifier) {
            // Render chart if there's chart fields, table if fields, both if both
            const tabs = [
                distribution.compatiblePreviews.chart &&
                    TabItem("chart", "Chart", this.renderChart()),
                distribution.compatiblePreviews.table &&
                    TabItem("table", "Table", this.renderTable())
            ].filter(x => !!x);

            return tabs.length ? this.renderTabs(tabs) : null;
        }
    }

    render() {
        const bodyRenderResult = this.renderByState();
        if (!bodyRenderResult) return null;
        return (
            <div className="data-preview-vis">
                <h3>Data Preview</h3>
                {bodyRenderResult}
            </div>
        );
    }
}

/**
 * Encapsulate tab object
 * @param {string} value
 * @param {string} item
 * @param {function} action
 */
const TabItem = (value, item, action) => {
    return {
        value: value,
        label: item,
        action: action
    };
};

export default DataPreviewVis;
