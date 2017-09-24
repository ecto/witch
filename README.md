![](http://witchlang.com/logo.png)

# experimental

```
git clone git@github.com:ecto/witch.git
cd witch
npm link
witch ./examples/0-function.w
llc out.bc
clang -o out out.s
./out
```
