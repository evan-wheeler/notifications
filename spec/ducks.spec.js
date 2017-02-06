
import reducer, {
    notifyError
} from '../src';

require('chai').should()

describe( "reducer", function()  {
    it( "should return an empty array", function() { 
        let a = [];
        reducer( a, "TEST" ).should.eql( a ); 
    } )
} );
