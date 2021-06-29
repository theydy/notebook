# 常用工具

## zsh

[最完整的item2搭配Oh My Zsh文档](https://zhuanlan.zhihu.com/p/183071329)

### oh-my-zsh

```sh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### powerlevel10k

[powerlevel10k 文档](https://github.com/romkatv/powerlevel10k#manual)

```sh
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k
echo 'source ~/powerlevel10k/powerlevel10k.zsh-theme' >>~/.zshrc
```

### 配置插件

```sh
cd "$ZSH_CUSTOM/plugins"
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
git clone https://github.com/zsh-users/zsh-autosuggestions.git

open ~/.zshrc
```

修改 plugins 配置为 `plugins=(git zsh-autosuggestions zsh-syntax-highlighting)` 

```sh
# 使配置生效
source ~/.zshrc
```
