import { interpolate } from '../server/api/index'

console.log(interpolate({ message: "{{$triggerData.date}}" }, { $triggerData: { date: 'pwic' } }));