"use strict"

function Pagination(pag = 100) {
  this.pag = pag
  this.step = 0
  this.loadingStep = 0
  this.hasMore = false
}

Pagination.prototype.reset = function () {
  this.step = 0
  this.loadingStep = 0
  this.hasMore = true
}

Pagination.prototype.incrLoadingStep = function () {
  this.loadingStep += this.pag
}

Pagination.prototype.decrLoadingStep = function () {
  this.loadingStep -= this.pag
}

Pagination.prototype.incrStep = function () {
  this.step += this.pag
}

Pagination.prototype.close = function () {
  this.hasMore = false
}

export default Pagination