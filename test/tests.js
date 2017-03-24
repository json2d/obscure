const tap = require('tap')

const Obscure = require('../lib/obscure.js')

const TARGETS = ['#myid','.myclass']
const FIXTURES = [
  {
    type: 'html',
    path:'id.html',
    data:'<div id="myid"></div>'
  },
  {
    type: 'html',
    path:'class.html',
    data:'<span class="myclass"></span>'
  },
  {
    type: 'css',
    path:'style.css',
    data:'.myclass, #myid { background: black; color: white }'
  },
]

const testObfuscateFixtures = (t,obscure,fixtures) => {
  fixtures.forEach((obj) => {
    let obfused = obscure.transformSync(obj.type, obj.data)
    obscure.targets.forEach((target) => {
      t.notOk(obfused.includes(target));
    })
  })
}

tap.test("obfuscates simple html and css snippets with explicit targets", function(t) {
  var obscure = new Obscure()
  obscure.init(TARGETS);

  testObfuscateFixtures(t,obscure,FIXTURES)

  t.end()

})


tap.test("obfuscates simple html and css snippets with implicit targets", function(t) {
  var obscure = new Obscure()
  obscure.init({
    include:[FIXTURES[0]],
  })

  testObfuscateFixtures(t,obscure,FIXTURES)

  t.end();

});
