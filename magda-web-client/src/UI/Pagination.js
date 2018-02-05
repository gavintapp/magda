import React, { Component } from 'react';
import {config} from '../config';
import left_arrow from "../assets/left-arrow.svg";
import right_arrow from "../assets/right-arrow.svg";

import Button from 'muicss/lib/react/button';
import './Pagination.css';

class Pagination extends Component {
    constructor(props) {
      super(props);
      this.onClick = this.onClick.bind(this);
      this.renderNextButton = this.renderNextButton.bind(this);
      this.renderPrevButton = this.renderPrevButton.bind(this);
    }

    onClick(page){
      this.props.onPageChange(page);
    }
    renderPrevButton(currentIndex){
      return <Button onClick={this.onClick.bind(this, currentIndex + 1)} className='btn-prev'> <img src={left_arrow} alt='previous page'/> </Button>
    }

    renderNextButton(currentIndex){
      return <Button onClick={this.onClick.bind(this, currentIndex - 1)} className='btn-next'> <img src={right_arrow} alt='next page'/> </Button>
    }

    renderDisabledButton(){
      return <Button disabled={true}>...</Button>;
    }

    renderPageList(max, current){
      const pages = [...Array(max).keys()].map(x => ++x);
      const margins = [...Array(3).keys()].map(x => ++x);
      if(max > 5){
        if(current <= 3 || current === max){
          return (<ul className= 'pagination-list'>
                    {current > 1 && this.renderPrevButton(current)}
                    {margins.map(i => <li key={i}><Button onClick={this.onClick.bind(this, i)} className={`${ i === current ? 'current' : ''}`}>{i}</Button></li>)}
                    <li>{this.renderDisabledButton()}</li>
                    <li><Button onClick={this.onClick.bind(this, max)} className={`${ max === current ? 'current' : ''}`}>{max}</Button></li>
                    {current < max && this.renderNextButton(current)}
                  </ul>)
      }
      return (<ul className= 'pagination-list'>
                {current > 1 && this.renderPrevButton(current)}
                {margins.map(i => <li key={i}><Button onClick={this.onClick.bind(this, i)}>{i}</Button></li>)}
                <li>{this.renderDisabledButton()}</li>
                <li><Button onClick={this.onClick.bind(this, current)} className='current'>{current}</Button></li>
                <li>{this.renderDisabledButton()}</li>
                <li><Button onClick={this.onClick.bind(max)}>{max}</Button></li>
                {current < max && this.renderNextButton(current)}
              </ul>)
      } else {
        return (<ul className= 'pagination-list'>
                {current > 1 && this.renderPrevButton(current)}
                {pages.map(i => <li key={i}><Button onClick={this.onClick.bind(this, i)} className={`${ i === current ? 'current' : ''}`}>{i}</Button></li>)}
                {current < max && this.renderNextButton(current)}
               </ul>)
      }
  }


    render(){
      let currentPage  = this.props.currentPage;
      let startIndex = currentPage ===  1 ? 1 : currentPage * config.resultsPerPage + 1;

      return (
        <div className='pagination'>
            {this.renderPageList(this.props.maxPage, currentPage)}
            <div className='pagination-summray'> {startIndex} - {startIndex + config.resultsPerPage} of {this.props.maxPage} results</div>
        </div>
      );
    }
}

export default Pagination;
