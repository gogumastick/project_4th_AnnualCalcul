// import React, { useState } from 'react';
import { useEffect } from 'react';
import { InputNumber, Space, Switch, Button, Typography } from 'antd';
import { useFormik } from 'formik';
import { PurchaseContentStyled } from '../styled';
import { sideBarData } from '@/utill/controllor';
import { sideBarCustom } from '@/utill/controllor';
import { useRecoilState } from 'recoil';
import { purchaseListState } from '@/utill/atom';

// const itemList = sideBarData;

const PurchaseContent = () => {
    // const [buyUser, setBuyUser] = useRecoilState<number>(buyUserState)
    const [purchaseList, setPurchaseList] = useRecoilState(purchaseListState);
    // console.log('PurchaseContent의 formik ', purchaseList);

    const purchaseFormik = useFormik({
        initialValues: {
            buyUser: 0,
            modules: sideBarData.reduce((acc, item) => {
                // 각 모듈의 초기 상태를 false로 설정
                acc[item.id] = { checked: false, name: item.name };
                return acc;
            }, {} as Record<number, { checked: boolean; name: string }>),
            customModules: sideBarCustom.reduce((acc, item) => {
                acc[item.id] = { checked: false, name: item.name };
                return acc;
            }, {} as Record<number, { checked: boolean; name: string }>),
        },
        onSubmit: (values) => {
            // console.log('제출된 값:', values);
            // 추가로 상태 업데이트나 API 요청을 이곳에서 처리
            // const newPurchaseList = values
            setPurchaseList(values);
        },
    });

    useEffect(() => {
        // purchaseList가 존재하는 경우, Formik 값을 업데이트
        if (purchaseList) {
            purchaseFormik.setValues({
                buyUser: purchaseList.buyUser || 0,
                modules: sideBarData.reduce((acc, item) => {
                    acc[item.id] = {
                        checked: purchaseList.modules?.[item.id]?.checked || false,
                        name: item.name,
                    };
                    return acc;
                }, {} as Record<number, { checked: boolean; name: string }>),
                customModules: sideBarCustom.reduce((acc, item) => {
                    acc[item.id] = {
                        checked: purchaseList.customModules?.[item.id]?.checked || false,
                        name: item.name,
                    };
                    return acc;
                }, {} as Record<number, { checked: boolean; name: string }>),
            });
        }
    }, [purchaseList]);

    return (
        <PurchaseContentStyled>
            <form onSubmit={purchaseFormik.handleSubmit}>
                <div className="purchaseContentWrap">
                    <div className="purchaseListBox">
                        <fieldset>
                            <legend>
                                <Typography.Title level={5}>사용할 총 USER 수</Typography.Title>
                            </legend>
                            <Space wrap>
                                <InputNumber
                                    size="large"
                                    min={1}
                                    max={100000}
                                    name="buyUser"
                                    value={purchaseFormik.values.buyUser}
                                    onChange={(value) => purchaseFormik.setFieldValue('buyUser', value)}
                                />
                                user
                            </Space>
                        </fieldset>

                        <fieldset>
                            <legend>
                                <Typography.Title level={5}>모듈 선택</Typography.Title>
                            </legend>
                            {sideBarData.map((item) => (
                                <div key={item.id}>
                                    <div>{item.name}</div>
                                    <Switch
                                        checked={purchaseFormik.values.modules[item.id].checked}
                                        onChange={(checked) =>
                                            purchaseFormik.setFieldValue(`modules.${item.id}.checked`, checked)
                                        }
                                    />
                                </div>
                            ))}
                        </fieldset>

                        <fieldset>
                            <legend>
                                <Typography.Title level={5}>커스텀 모듈</Typography.Title>
                            </legend>
                            {sideBarCustom.map((item) => (
                                <div key={item.id}>
                                    <div>{item.name}</div>
                                    <Switch
                                        checked={purchaseFormik.values.customModules[item.id].checked}
                                        onChange={(checked) =>
                                            purchaseFormik.setFieldValue(`customModules.${item.id}.checked`, checked)
                                        }
                                    />
                                </div>
                            ))}
                        </fieldset>
                    </div>

                    <div className="purchaseBtn">
                        <Button type="primary" htmlType="submit">
                            구매
                        </Button>
                    </div>
                </div>
            </form>
        </PurchaseContentStyled>
    );
};

export default PurchaseContent;
