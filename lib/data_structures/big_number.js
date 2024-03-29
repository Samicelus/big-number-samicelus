const _ = require('lodash')
const Constants = require('../constants')

class BIGNUMBER{
  constructor(str){
    this.valid = this.valid.bind(this)
    this.parse = this.parse.bind(this)
    this.add = this.add.bind(this)
    this.subtract = this.subtract.bind(this)
    this.multiply_single = this.multiply_single.bind(this)
    this.inverse = this.inverse.bind(this)
    this.multiply = this.multiply.bind(this)
    this.format_result = this.format_result.bind(this)
    this.toString = this.toString.bind(this)
    let valid_result = this.valid(str)
    if(!valid_result.result){
      throw new Error(valid_result.message)
    }
    this.value = []
    this.point = 0
    this.parse(str)
  }

  valid(big_number){
    if(big_number instanceof BIGNUMBER){
      return {result:true}
    }
    if(typeof big_number == "number"){
      return {result:true}
    }
    if(typeof big_number == "string"){
      big_number = big_number.trim()
      let regex = /\./g
      let points = big_number.match(regex)
      if(Array.isArray(points) && points.length>1){
        return {result:false, message:`decimal number includes more than 1 '.'`}
      }
      let no_digital_regex = /[^-^.\d]/g
      let no_digital = big_number.match(no_digital_regex)
      if(Array.isArray(no_digital) && no_digital.length>0){
        return {result:false, message:`can't parse ${big_number}`}
      }
    }else{
      return {result:false, message:`can't parse ${big_number}`}
    }
    return {result:true}
  }

  parse(big_number){
    let negative = false
    if(big_number instanceof BIGNUMBER){
      this.value = _.clone(big_number.value)
      this.point = big_number.point
      return
    }
    if(typeof big_number == "number"){
      big_number = big_number.toString()
    }
    big_number = big_number.trim()
    let negative_regex = /^-/
    if(negative_regex.test(big_number)){
      negative = true
      big_number = big_number.replace(negative_regex,'')
    }

    let zero_regex = /(^0+)|(0+$)/g
    big_number = big_number.replace(zero_regex, '')
    if(big_number.indexOf('.') == -1){
      this.point = 0
    }else{
      this.point = big_number.length - (big_number.indexOf('.')+1)
    }
    if(big_number){
      this.value = big_number.replace('.','').split("").map(item=>negative?-Number(item):Number(item)).reverse()
    }else{
      this.value = [0]
    }
  }

  add(number2){
    let other_number = new BIGNUMBER(number2)
    let temp_value = _.clone(this.value)
    let temp_point = this.point
    let temp_value_2 = _.clone(other_number.value)
    let temp_point_2 = _.clone(other_number.point)
    let point_diff = temp_point - temp_point_2
    if(point_diff>0){
      for(let i=0; i<point_diff; i++){
        temp_value_2.unshift(0)
        temp_point_2 ++
      }
    }else{
      for(let i=0; i<-point_diff; i++){
        temp_value.unshift(0)
        temp_point ++
      }
    }
    let bit_diff = temp_value.length - temp_value_2.length
    if(bit_diff>0){
      for(let i=0; i<bit_diff; i++){
        temp_value_2.push(0)
      }
    }else{
      for(let i=0; i<-bit_diff; i++){
        temp_value.push(0)
      }
    }
    temp_value = temp_value.map((item, index)=>{
      return item + temp_value_2[index]
    })
    return this.format_result(temp_value, temp_point)
  }

  subtract(number2){
    let other_number = new BIGNUMBER(number2)
    other_number.value = other_number.value.map(item=>-item)
    return this.add(other_number)
  }

  multiply_single(single, original){
    if(!Constants.VALIDSINGLE.includes(single)){
      throw new Error(`valid single number is 0-9`)
    }
    if(!original){
      original = new BIGNUMBER(this)
    }
    let single_value = Number(single)
    if(single_value>1){
      return this.add(original).multiply_single(single_value - 1, original)
    }else if(single_value == 1){
      return _.clone(this)
    }else if(single_value == 0){
      return new BIGNUMBER(0)
    }
  }

  inverse(){
    this.value = this.value.map(item => -item)
  }

  multiply(number2){
    let other_number = new BIGNUMBER(number2)
    let positive = (other_number.value[other_number.value.length-1] >= 0)
    if(!positive){
      other_number.inverse()
    }
    let sum = new BIGNUMBER(0)
    for(let index in other_number.value){
      let single = other_number.value[index]
      let temp = this.multiply_single(single)
      temp.point -= index
      sum = sum.add(temp)
    }
    sum.point += other_number.point
    if(positive){
      return sum
    }else{
      sum.inverse()
      return sum
    }
  }

  format_result(temp_value, temp_point){
    let positive = (temp_value[temp_value.length-1] > 0)

    if(!positive){
      temp_value = temp_value.map(item => -item)
    }

    for(let index in temp_value){
      let current_value = temp_value[index]
      if(current_value > 9){
        temp_value[index] = current_value - 10
        if(!temp_value[Number(index)+1]){
          temp_value[Number(index)+1] = 1
        }else{
          temp_value[Number(index)+1] ++
        }
      }
      if(current_value < 0){
        temp_value[index] = 10 + current_value
        if(!temp_value[Number(index)+1]){
          temp_value[Number(index)+1] = -1
        }else{
          temp_value[Number(index)+1] --
        }
      }
    }

    temp_value.splice(temp_point, 0, '.')
    temp_value = temp_value.map(item=>item.toString()).reverse().join('')
    let zero_regex = /(^0+)|(0+$)|(\.0+$)/g
    temp_value = temp_value.replace(zero_regex, '')
    if(!positive){
      temp_value = `-${temp_value}`
    }
    return new BIGNUMBER(temp_value)
  }

  toString(){
    let temp_value = _.clone(this.value)
    let temp_point = this.point
    let positive = (temp_value[temp_value.length-1] >= 0)
    if(!positive){
      temp_value = temp_value.map(item=>-item)
    }
    if(temp_point > 0){
      temp_value.splice(temp_point, 0, '.')
    }else if(temp_point < 0){
      temp_value.splice(0, -temp_point, '0')
    }
    temp_value = temp_value.map(item=>item.toString()).reverse().join('')
    let zero_regex = /\.0+$/g
    temp_value = temp_value.replace(zero_regex, '')
    if(!positive){
      temp_value = `-${temp_value}`
    }
    return temp_value
  }

}

module.exports = BIGNUMBER