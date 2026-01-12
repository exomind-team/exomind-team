踩坑1:官方文档中的[自定义固件](https://developer.canaan-creative.com/k230_canmv/main/zh/userguide/how_to_build.html)部分代码是旧的库，[新的库](https://github.com/kendryte/canmv_k230/tree/main)方法为[BUILD](https://github.com/kendryte/canmv_k230/blob/main/BUILD.md)
踩坑2：不能在`~`路径下新建repo，会将代码同步到当前路径

编译用玄铁riscv64 musl的GCC编译器编译

可选开发板
```
1 [ ] k230_aihardware__128m_defconfig
2 [ ] k230_aihardware_defconfig
3 [ ] k230_canmv_01studio_defconfig
4 [ ] k230_canmv_defconfig
5 [ ] k230_canmv_dongshanpi_defconfig
6 [ ] k230_canmv_lckfb_defconfig
7 [ ] k230_canmv_v3p0_defconfig
8 [ ] k230_evb__k230d_defconfig
9 [ ] k230_evb_defconfig
10 [ ] k230d_canmv_atk_dnk230d_defconfig
11 [ ] k230d_canmv_bpi_zero_defconfig
12 [ ] k230d_labplus_ai_camera_defconfig
```
