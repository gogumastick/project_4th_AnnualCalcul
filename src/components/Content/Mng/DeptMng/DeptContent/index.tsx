import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useRecoilValue } from 'recoil';
import { deptDataState } from '@/utill/atom';
import { DeptContentStyled } from '../styled';
import { DeptDataNode } from '@/utill/interface';

const { Search } = Input;

const DeptContent = () => {
    const deptData = useRecoilValue(deptDataState);

    // deptData의 정확한 구조 확인
    // console.log('deptData 전체 구조:', JSON.stringify(deptData, null, 2));

    // 디버깅을 위한 상세 로그
    // console.log('1. deptData 원본:', deptData);
    // console.log('2. deptData의 타입:', typeof deptData);
    // console.log('3. Array.isArray(deptData):', Array.isArray(deptData));

    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    // deptData를 TreeDataNode 형식으로 변환
    const convertToTreeData = (data: DeptDataNode[]): TreeDataNode[] =>
        data.map((dept, index) => ({
            title: dept.title,
            key: dept.key || `${index}+deptIndexNode`,
            children: dept.children ? convertToTreeData(dept.children) : [],
        }));

    // deptData가 배열이 아닌 경우 배열로 변환 및 초기 데이터가 없을 때 빈 배열 반환
    const defaultData: TreeDataNode[] = useMemo(() => {
        if (!deptData) return [];
        const safeData = Array.isArray(deptData) ? deptData : [deptData];
        return convertToTreeData(safeData.filter((item): item is DeptDataNode => 'title' in item && 'key' in item));
    }, [deptData]);


    useEffect(() => {
        // 모든 노드의 key를 수집하여 expandedKeys로 설정
        const getAllKeys = (data: TreeDataNode[]): React.Key[] => {
            let keys: React.Key[] = [];
            data.forEach((node) => {
                keys.push(node.key); // 현재 노드의 key 추가
                if (node.children) {
                    keys = keys.concat(getAllKeys(node.children)); // 자식 노드의 key 추가
                }
            });
            return keys;
        };

        setExpandedKeys(getAllKeys(defaultData));
    }, [defaultData]);

    // 데이터 목록 생성 (검색 기능용)
    const dataList: { key: React.Key; title: string }[] = [];
    const generateList = (data: TreeDataNode[]) => {
        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            dataList.push({ key: node.key, title: node.title as string });
            if (node.children) {
                generateList(node.children);
            }
        }
    };
    generateList(defaultData);

    const getParentKey = (key: React.Key, tree: TreeDataNode[]): React.Key | undefined => {
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some((child) => child.key === key)) {
                    return node.key;
                }
                const parentKey = getParentKey(key, node.children);
                if (parentKey) return parentKey;
            }
        }
    };

    // 검색 기능
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const newExpandedKeys = dataList
            .map((item) => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, defaultData);
                }
                return null;
            })
            .filter((item, i, self): item is React.Key => !!item && self.indexOf(item) === i);
        setExpandedKeys(newExpandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };

    // 트리 데이터에 검색 결과 반영
    const treeData = useMemo(() => {
        if (!defaultData.length) return []; // 데이터가 없을 때 빈 배열 반환

        const loop = (data: TreeDataNode[]): TreeDataNode[] =>
            data.map((item) => {
                const strTitle = item.title?.toString() || '';
                const index = strTitle.indexOf(searchValue);
                const beforeStr = strTitle.substring(0, index);
                const afterStr = strTitle.slice(index + searchValue.length);
                const title =
                    index > -1 ? (
                        <span>
                            {beforeStr}
                            <span style={{ color: 'red' }}>{searchValue}</span>
                            {afterStr}
                        </span>
                    ) : (
                        <span>{strTitle}</span>
                    );
                if (item.children) {
                    return { title, key: item.key, children: loop(item.children) };
                }
                return { title, key: item.key };
            });
        return loop(defaultData);
    }, [searchValue, defaultData]);

    const onExpand = (expandedKeysValue: React.Key[]) => {
        // 노드의 접힘 상태를 업데이트
        setExpandedKeys(expandedKeysValue);
        // 부모 노드 자동 확장 비활성화
        setAutoExpandParent(false);
    };

    const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
        console.log('onCheck', checkedKeys, info);
    };

    // deptData 디버깅을 위한 로그 추가
    useEffect(() => {
        console.log('Current deptData:', deptData);
    }, [deptData]);

    return (
        <DeptContentStyled>
            <div className="topBox">
                <div className="serchBox">
                    <Search placeholder="Search" onChange={onChange} />
                </div>
                <div className="fncBtnBox">
                    <Button>수정</Button>
                    <Button>삭제</Button>
                </div>
            </div>
            <Tree
                checkable
                // 부모-자식 노드의 체크 상태 연결 해제
                checkStrictly
                showLine
                switcherIcon={<DownOutlined />}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                // onSelect={onSelect}
                onCheck={onCheck}
                treeData={treeData}
            />
        </DeptContentStyled>
    );
};

export default DeptContent;